import EditClips from "@/app/profile/edit/song-clips/[slot]/edit-clips";
import { ToastContext } from "@/context/toast";
import type { SongClip } from "@/lib/db/types";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPush = vi.fn();
const mockRefresh = vi.fn();
const mockProcessAudioForUpload = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

vi.mock("@/lib/audio/trim-clip", () => ({
  processAudioForUpload: (...args: unknown[]) =>
    mockProcessAudioForUpload(...args),
}));

vi.mock("@/components/wave-surfer", () => ({
  default: ({
    onSelectionChange,
  }: {
    onSelectionChange?: (selection: { start: number; end: number }) => void;
  }) => (
    <button
      type="button"
      onClick={() => onSelectionChange?.({ start: 0, end: 15 })}
    >
      Set region
    </button>
  ),
}));

const existingClip = {
  id: 10,
  slot: 0,
  title: "Existing Track",
  db_url: "https://example.com/clip.wav",
  full_song_url: "https://example.com/full-track",
} as SongClip;

function renderEditClips(
  props: { clip?: SongClip; slot?: number } = {},
  setToast = vi.fn(),
) {
  const { container } = render(
    <ToastContext.Provider value={{ toast: null, setToast }}>
      <EditClips
        clip={props.clip}
        slot={props.slot ?? 0}
        isVerified
      />
    </ToastContext.Provider>,
  );
  return { container, setToast };
}

describe("EditClips", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    mockProcessAudioForUpload.mockResolvedValue(
      new File(["trimmed"], "clip.wav", { type: "audio/wav" }),
    );
  });

  describe("existing clip (edit)", () => {
    it("renders the existing title and full song url", () => {
      renderEditClips({ clip: existingClip });

      expect(screen.getByDisplayValue("Existing Track")).toBeDefined();
      expect(
        screen.getByDisplayValue("https://example.com/full-track"),
      ).toBeDefined();
      expect(screen.getByRole("button", { name: "Delete file" })).toBeDefined();
    });

    it("posts metadata edits to /api/profile/edit-song-clip", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });
      const setToast = vi.fn();
      renderEditClips({ clip: existingClip }, setToast);

      fireEvent.change(screen.getByDisplayValue("Existing Track"), {
        target: { value: "Updated Track" },
      });
      fireEvent.change(
        screen.getByDisplayValue("https://example.com/full-track"),
        { target: { value: "https://example.com/new-track" } },
      );

      fireEvent.submit(screen.getByRole("button", { name: "Save" }).closest("form")!);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/profile/edit-song-clip",
          expect.objectContaining({
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: "Updated Track",
              full_song_url: "https://example.com/new-track",
              id: 10,
            }),
          }),
        );
        expect(setToast).toHaveBeenCalledWith({
          message: "Song clip edited successfully",
          type: "success",
        });
        expect(mockRefresh).toHaveBeenCalled();
        expect(mockPush).toHaveBeenCalledWith("/profile");
      });
    });

    it("shows an error toast when edit fails", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Song clip not found" }),
      });
      const setToast = vi.fn();
      renderEditClips({ clip: existingClip }, setToast);

      fireEvent.submit(
        screen.getByRole("button", { name: "Save" }).closest("form")!,
      );

      await waitFor(() => {
        expect(setToast).toHaveBeenCalledWith({
          message: "Song clip not found",
          type: "error",
        });
        expect(mockPush).not.toHaveBeenCalled();
      });
    });
  });

  describe("new clip (upload)", () => {
    it("toasts when submitting without a file and region", async () => {
      const setToast = vi.fn();
      renderEditClips({}, setToast);

      fireEvent.submit(
        screen.getByRole("button", { name: "Save" }).closest("form")!,
      );

      await waitFor(() => {
        expect(setToast).toHaveBeenCalledWith({
          message: "Select a file and clip region before uploading",
          type: "error",
        });
        expect(global.fetch).not.toHaveBeenCalled();
      });
    });

    it("trims audio and posts to /api/profile/upload-song-clip", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });
      const setToast = vi.fn();
      const { container } = renderEditClips({ slot: 1 }, setToast);

      const file = new File(["audio"], "my-song.wav", { type: "audio/wav" });
      const input = container.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      fireEvent.change(input, { target: { files: [file] } });
      fireEvent.click(screen.getByRole("button", { name: "Set region" }));
      fireEvent.submit(
        screen.getByRole("button", { name: "Save" }).closest("form")!,
      );

      await waitFor(() => {
        expect(mockProcessAudioForUpload).toHaveBeenCalledWith(file, 0, 15);
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/profile/upload-song-clip",
          expect.objectContaining({ method: "POST" }),
        );
        expect(setToast).toHaveBeenCalledWith({
          message: "Song clip uploaded successfully",
          type: "success",
        });
        expect(mockRefresh).toHaveBeenCalled();
        expect(mockPush).toHaveBeenCalledWith("/profile");
      });

      const body = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1]
        .body as FormData;
      expect(body.get("file")).toBeInstanceOf(File);
      expect(JSON.parse(body.get("metadata") as string)).toEqual({
        index: 1,
        title: "my-song",
        fullSongUrl: "",
        selectedRegion: { start: 0, end: 15 },
      });
    });

    it("toasts when the upload API fails", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: "Failed to upload audio file" }),
      });
      const setToast = vi.fn();
      const { container } = renderEditClips({}, setToast);

      const file = new File(["audio"], "my-song.wav", { type: "audio/wav" });
      fireEvent.change(container.querySelector('input[type="file"]')!, {
        target: { files: [file] },
      });
      fireEvent.click(screen.getByRole("button", { name: "Set region" }));
      fireEvent.submit(
        screen.getByRole("button", { name: "Save" }).closest("form")!,
      );

      await waitFor(() => {
        expect(setToast).toHaveBeenCalledWith({
          message: "Failed to upload audio file",
          type: "error",
        });
        expect(mockPush).not.toHaveBeenCalled();
      });
    });

    it("toasts when the trimmed file is too large", async () => {
      const largeFile = new File(
        [new Uint8Array(5 * 1024 * 1024)],
        "big.wav",
        { type: "audio/wav" },
      );
      mockProcessAudioForUpload.mockResolvedValue(largeFile);

      const setToast = vi.fn();
      const { container } = renderEditClips({}, setToast);

      fireEvent.change(container.querySelector('input[type="file"]')!, {
        target: {
          files: [new File(["audio"], "my-song.wav", { type: "audio/wav" })],
        },
      });
      fireEvent.click(screen.getByRole("button", { name: "Set region" }));
      fireEvent.submit(
        screen.getByRole("button", { name: "Save" }).closest("form")!,
      );

      await waitFor(() => {
        expect(setToast).toHaveBeenCalledWith({
          message: "File is too large",
          type: "error",
        });
        expect(global.fetch).not.toHaveBeenCalled();
      });
    });
  });
});
