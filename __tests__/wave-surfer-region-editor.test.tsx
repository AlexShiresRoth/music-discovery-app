import { MAX_SONG_CLIP_DURATION_SECONDS } from "@/app/profile/schemas";
import WaveSurferUI from "@/components/wave-surfer";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const wsHandlers: Record<string, Array<(...args: unknown[]) => void>> = {};
const regionHandlers: Record<string, Array<(...args: unknown[]) => void>> = {};

const mockRegionPlay = vi.fn();
const mockAddRegion = vi.fn((region: { start: number; end: number }) => ({
  ...region,
  id: "region-1",
  play: mockRegionPlay,
  remove: vi.fn(),
}));
const mockClearRegions = vi.fn();
const mockGetRegions = vi.fn(() => []);
const mockEnableDragSelection = vi.fn(() => vi.fn());

const mockRegions = {
  enableDragSelection: mockEnableDragSelection,
  clearRegions: mockClearRegions,
  addRegion: mockAddRegion,
  getRegions: mockGetRegions,
  on: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
    regionHandlers[event] = regionHandlers[event] ?? [];
    regionHandlers[event].push(handler);
    return () => {
      regionHandlers[event] = (regionHandlers[event] ?? []).filter(
        (h) => h !== handler,
      );
    };
  }),
};

const mockWs = {
  setMuted: vi.fn(),
  setVolume: vi.fn(),
  setTime: vi.fn(),
  setOptions: vi.fn(),
  getMuted: vi.fn(() => false),
  getDuration: vi.fn(() => 180),
  getWidth: vi.fn(() => 350),
  getCurrentTime: vi.fn(() => 0),
  zoom: vi.fn(),
  setScrollTime: vi.fn(),
  loadBlob: vi.fn(() => Promise.resolve()),
  play: vi.fn(),
  pause: vi.fn(),
  isPlaying: vi.fn(() => false),
  destroy: vi.fn(),
  on: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
    wsHandlers[event] = wsHandlers[event] ?? [];
    wsHandlers[event].push(handler);
    return () => {
      wsHandlers[event] = (wsHandlers[event] ?? []).filter((h) => h !== handler);
    };
  }),
};

vi.mock("wavesurfer.js", () => ({
  default: {
    create: vi.fn(() => mockWs),
  },
}));

vi.mock("wavesurfer.js/dist/plugins/hover.js", () => ({
  default: { create: vi.fn(() => ({})) },
}));

vi.mock("wavesurfer.js/dist/plugins/regions.js", () => ({
  default: {
    create: vi.fn(() => mockRegions),
  },
}));

function emitRegion(event: string, region: unknown) {
  for (const handler of regionHandlers[event] ?? []) {
    handler(region);
  }
}

function renderEditor(
  props: {
    file?: File;
    selectedRegion?: { start: number; end: number } | null;
    onSelectionChange?: (
      selection: { start: number; end: number } | null,
    ) => void;
  } = {},
) {
  const onSelectionChange = props.onSelectionChange ?? vi.fn();
  const file =
    props.file ?? new File(["audio"], "demo-track.wav", { type: "audio/wav" });

  const result = render(
    <WaveSurferUI
      file={file}
      onSelectionChange={onSelectionChange}
      selectedRegion={props.selectedRegion}
    />,
  );

  return { ...result, onSelectionChange, file };
}

describe("WaveSurfer region editor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = "";
    for (const key of Object.keys(wsHandlers)) delete wsHandlers[key];
    for (const key of Object.keys(regionHandlers)) delete regionHandlers[key];
    mockGetRegions.mockReturnValue([]);
    mockWs.getDuration.mockReturnValue(180);
    mockWs.getWidth.mockReturnValue(350);
    mockWs.loadBlob.mockResolvedValue(undefined);
    mockWs.isPlaying.mockReturnValue(false);
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    });
  });

  it("zooms long tracks and shows scroll-focused help copy", async () => {
    renderEditor();

    await waitFor(() => {
      expect(mockWs.loadBlob).toHaveBeenCalled();
      expect(mockAddRegion).toHaveBeenCalledWith(
        expect.objectContaining({
          start: 0,
          end: MAX_SONG_CLIP_DURATION_SECONDS,
          drag: true,
          resize: true,
        }),
      );
    });

    expect(
      screen.getByText(
        /Scroll to find a section, then drag the highlighted region/,
      ),
    ).toBeDefined();
    expect(screen.getByRole("button", { name: "Show full track" })).toBeDefined();
    expect(screen.getByText("Preview")).toBeDefined();

    const visibleSeconds = MAX_SONG_CLIP_DURATION_SECONDS / 0.7;
    expect(mockWs.zoom).toHaveBeenCalledWith(350 / visibleSeconds);
    expect(mockWs.setScrollTime).toHaveBeenCalled();
    expect(mockRegionPlay).not.toHaveBeenCalled();
  });

  it("uses short-track help copy when the file fits on screen", async () => {
    mockWs.getDuration.mockReturnValue(20);
    renderEditor();

    await waitFor(() => {
      expect(
        screen.getByText(
          /Drag the highlighted region to choose up to 30s/,
        ),
      ).toBeDefined();
    });
    expect(screen.queryByRole("button", { name: "Show full track" })).toBeNull();
  });

  it("toggles full-track overview zoom for long files", async () => {
    renderEditor();

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Show full track" })).toBeDefined(),
    );

    fireEvent.click(screen.getByRole("button", { name: "Show full track" }));

    await waitFor(() => {
      expect(mockWs.zoom).toHaveBeenCalledWith(350 / 180);
      expect(mockWs.setScrollTime).toHaveBeenCalledWith(0);
      expect(
        screen.getByText(/Overview of the full track/),
      ).toBeDefined();
      expect(screen.getByRole("button", { name: "Zoom to clip" })).toBeDefined();
    });
  });

  it("uses an existing selected region when loading the file", async () => {
    renderEditor({ selectedRegion: { start: 12, end: 27 } });

    await waitFor(() => {
      expect(mockAddRegion).toHaveBeenCalledWith(
        expect.objectContaining({ start: 12, end: 27 }),
      );
    });
  });

  it("ignores stale load results when the file changes quickly", async () => {
    let resolveFirst: (() => void) | undefined;
    let resolveSecond: (() => void) | undefined;
    mockWs.loadBlob
      .mockImplementationOnce(
        () =>
          new Promise<void>((resolve) => {
            resolveFirst = resolve;
          }),
      )
      .mockImplementationOnce(
        () =>
          new Promise<void>((resolve) => {
            resolveSecond = resolve;
          }),
      );

    const first = new File(["a"], "first.wav", { type: "audio/wav" });
    const second = new File(["b"], "second.wav", { type: "audio/wav" });
    const onSelectionChange = vi.fn();

    const { rerender } = render(
      <WaveSurferUI
        file={first}
        onSelectionChange={onSelectionChange}
        selectedRegion={null}
      />,
    );

    rerender(
      <WaveSurferUI
        file={second}
        onSelectionChange={onSelectionChange}
        selectedRegion={null}
      />,
    );

    mockWs.getDuration.mockReturnValue(90);
    await act(async () => {
      resolveFirst?.();
    });
    expect(mockAddRegion).not.toHaveBeenCalled();

    mockWs.getDuration.mockReturnValue(120);
    await act(async () => {
      resolveSecond?.();
    });

    await waitFor(() => {
      expect(mockAddRegion).toHaveBeenCalledTimes(1);
      expect(screen.getByText("second.wav")).toBeDefined();
    });
  });

  it("notifies selection changes without autoplaying the region", async () => {
    const onSelectionChange = vi.fn();
    renderEditor({ onSelectionChange });

    await waitFor(() => {
      expect(mockRegions.on).toHaveBeenCalled();
    });

    const region = {
      id: "dragged",
      start: 5,
      end: 20,
      play: mockRegionPlay,
      remove: vi.fn(),
    };

    act(() => {
      emitRegion("region-updated", region);
    });

    expect(onSelectionChange).toHaveBeenCalledWith({ start: 5, end: 20 });
    expect(mockRegionPlay).not.toHaveBeenCalled();
    expect(mockWs.play).not.toHaveBeenCalled();
  });

  it("keeps a single region when a new one is created", async () => {
    const onSelectionChange = vi.fn();
    const oldRegion = {
      id: "old",
      start: 0,
      end: 10,
      play: vi.fn(),
      remove: vi.fn(),
    };
    mockGetRegions.mockReturnValue([oldRegion]);
    renderEditor({ onSelectionChange });

    await waitFor(() => expect(mockRegions.on).toHaveBeenCalled());

    const created = {
      id: "new",
      start: 8,
      end: 22,
      play: mockRegionPlay,
      remove: vi.fn(),
    };

    act(() => {
      emitRegion("region-created", created);
    });

    expect(oldRegion.remove).toHaveBeenCalled();
    expect(onSelectionChange).toHaveBeenCalledWith({ start: 8, end: 22 });
    expect(mockRegionPlay).not.toHaveBeenCalled();
  });

  it("enters fullscreen, grows the waveform, and locks body scroll", async () => {
    document.body.style.overflow = "auto";
    renderEditor();

    await waitFor(() => expect(mockWs.loadBlob).toHaveBeenCalled());

    fireEvent.click(screen.getByRole("button", { name: "Enlarge editor" }));

    expect(
      screen.getByRole("button", { name: "Exit larger editor" }),
    ).toBeDefined();
    expect(document.body.style.overflow).toBe("hidden");

    await waitFor(() => {
      expect(mockWs.setOptions).toHaveBeenCalledWith({ height: 280 });
    });
  });

  it("exits fullscreen with Escape and restores body scroll", async () => {
    document.body.style.overflow = "auto";
    renderEditor();

    await waitFor(() => expect(mockWs.loadBlob).toHaveBeenCalled());

    fireEvent.click(screen.getByRole("button", { name: "Enlarge editor" }));
    expect(document.body.style.overflow).toBe("hidden");

    fireEvent.keyDown(window, { key: "Escape" });

    expect(
      screen.getByRole("button", { name: "Enlarge editor" }),
    ).toBeDefined();
    expect(document.body.style.overflow).toBe("auto");
  });

  it("plays the selected region when play is pressed", async () => {
    renderEditor({ selectedRegion: { start: 4, end: 19 } });

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Play clip preview" }),
      ).toHaveProperty("disabled", false);
    });

    fireEvent.click(screen.getByRole("button", { name: "Play clip preview" }));

    expect(mockWs.play).toHaveBeenCalledWith(4, 19);
  });
});
