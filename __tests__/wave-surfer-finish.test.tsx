import WaveSurferUI from "@/components/wave-surfer";
import { FeedAudioContext } from "@/context/feed-audio";
import { act, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const handlers: Record<string, Array<() => void>> = {};

const mockWs = {
  setMuted: vi.fn(),
  setVolume: vi.fn(),
  getMuted: vi.fn(() => false),
  getDuration: vi.fn(() => 10),
  getCurrentTime: vi.fn(() => 0),
  play: vi.fn(),
  pause: vi.fn(),
  isPlaying: vi.fn(() => false),
  destroy: vi.fn(),
  on: vi.fn((event: string, handler: () => void) => {
    handlers[event] = handlers[event] ?? [];
    handlers[event].push(handler);
    return () => {
      handlers[event] = (handlers[event] ?? []).filter((h) => h !== handler);
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

function emit(event: string) {
  for (const handler of handlers[event] ?? []) {
    handler();
  }
}

function renderWaveSurfer({
  isActive = true,
  isPlaying = true,
  onFinish = vi.fn(),
}: {
  isActive?: boolean;
  isPlaying?: boolean;
  onFinish?: () => void;
} = {}) {
  return render(
    <FeedAudioContext.Provider
      value={{
        isMuted: false,
        toggleMute: vi.fn(),
        isPlaying,
        togglePlayPause: vi.fn(),
        canPlay: true,
        setCanPlay: vi.fn(),
        onFinish: vi.fn(),
      }}
    >
      <WaveSurferUI
        url="https://example.com/clip.mp3"
        clipName="Clip"
        isActive={isActive}
        isOnFeed
        onFinish={onFinish}
      />
    </FeedAudioContext.Provider>,
  );
}

describe("WaveSurfer feed finish", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    for (const key of Object.keys(handlers)) {
      delete handlers[key];
    }
  });

  it("calls onFinish when an active playing clip finishes", () => {
    const onFinish = vi.fn();
    renderWaveSurfer({ isActive: true, isPlaying: true, onFinish });

    act(() => {
      emit("ready");
      emit("finish");
    });

    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it("does not call onFinish when the clip is not active", () => {
    const onFinish = vi.fn();
    renderWaveSurfer({ isActive: false, isPlaying: true, onFinish });

    act(() => {
      emit("ready");
      emit("finish");
    });

    expect(onFinish).not.toHaveBeenCalled();
  });

  it("does not call onFinish when feed playback is paused", () => {
    const onFinish = vi.fn();
    renderWaveSurfer({ isActive: true, isPlaying: false, onFinish });

    act(() => {
      emit("ready");
      emit("finish");
    });

    expect(onFinish).not.toHaveBeenCalled();
  });
});
