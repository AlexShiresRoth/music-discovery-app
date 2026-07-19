import {
  convertTimeToSampleIndexes,
  encodeAudioBuffer,
  processAudioForUpload,
  sliceAudioBuffer,
} from "@/lib/audio/trim-clip";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

class FakeAudioBuffer {
  readonly length: number;
  readonly numberOfChannels: number;
  readonly sampleRate: number;
  private readonly channels: Float32Array[];

  constructor({
    length,
    numberOfChannels,
    sampleRate,
  }: {
    length: number;
    numberOfChannels: number;
    sampleRate: number;
  }) {
    this.length = length;
    this.numberOfChannels = numberOfChannels;
    this.sampleRate = sampleRate;
    this.channels = Array.from(
      { length: numberOfChannels },
      () => new Float32Array(length),
    );
  }

  getChannelData(channel: number) {
    return this.channels[channel]!;
  }

  copyToChannel(source: Float32Array, channel: number, offset = 0) {
    this.channels[channel]!.set(source, offset);
  }
}

const mockDecodeAudioData = vi.fn();
const mockClose = vi.fn().mockResolvedValue(undefined);

beforeAll(() => {
  vi.stubGlobal("AudioBuffer", FakeAudioBuffer);
  vi.stubGlobal(
    "AudioContext",
    class {
      decodeAudioData = mockDecodeAudioData;
      close = mockClose;
    },
  );
});

function makeBuffer({
  channels = 1,
  length = 44100,
  sampleRate = 44100,
  fill,
}: {
  channels?: number;
  length?: number;
  sampleRate?: number;
  fill?: (channel: number, index: number) => number;
}): AudioBuffer {
  const buffer = new AudioBuffer({
    length,
    numberOfChannels: channels,
    sampleRate,
  });

  for (let channel = 0; channel < channels; channel++) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      data[i] = fill ? fill(channel, i) : 0;
    }
  }

  return buffer;
}

describe("convertTimeToSampleIndexes", () => {
  it("converts seconds to sample indexes", async () => {
    const buffer = makeBuffer({ length: 44100 * 10, sampleRate: 44100 });

    const { startSample, endSample } = await convertTimeToSampleIndexes(
      buffer,
      2,
      7,
    );

    expect(startSample).toBe(44100 * 2);
    expect(endSample).toBe(44100 * 7);
  });

  it("clamps indexes to the buffer bounds", async () => {
    const buffer = makeBuffer({ length: 1000, sampleRate: 44100 });

    const { startSample, endSample } = await convertTimeToSampleIndexes(
      buffer,
      -1,
      999,
    );

    expect(startSample).toBe(0);
    expect(endSample).toBe(1000);
  });
});

describe("sliceAudioBuffer", () => {
  it("copies only the selected sample window", () => {
    const source = makeBuffer({
      length: 44100 * 20,
      fill: (_channel, index) => index,
    });

    const startSample = 44100 * 2;
    const endSample = 44100 * 7;
    const trimmed = sliceAudioBuffer(source, startSample, endSample);

    expect(trimmed.sampleRate).toBe(44100);
    expect(trimmed.length).toBe(endSample - startSample);
    expect(trimmed.getChannelData(0)[0]).toBe(startSample);
    expect(trimmed.getChannelData(0)[trimmed.length - 1]).toBe(endSample - 1);
  });
});

describe("encodeAudioBuffer", () => {
  it("writes a mono WAV file with a valid header", async () => {
    const buffer = makeBuffer({
      channels: 2,
      length: 4,
      fill: (channel) => (channel === 0 ? 0.5 : -0.5),
    });

    const file = encodeAudioBuffer(buffer, "my-song.mp3");
    const bytes = new Uint8Array(await file.arrayBuffer());

    expect(file.name).toBe("my-song-clip.wav");
    expect(file.type).toBe("audio/wav");
    expect(String.fromCharCode(...bytes.slice(0, 4))).toBe("RIFF");
    expect(String.fromCharCode(...bytes.slice(8, 12))).toBe("WAVE");
    expect(bytes.byteLength).toBe(44 + 4 * 2); // header + mono int16 samples
  });
});

describe("processAudioForUpload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockClose.mockResolvedValue(undefined);
  });

  it("decodes, slices, and returns an encoded wav file", async () => {
    const decoded = makeBuffer({
      length: 44100 * 20,
      sampleRate: 44100,
      fill: (_channel, index) => (index % 100) / 100,
    });
    mockDecodeAudioData.mockResolvedValue(decoded);

    const input = new File([new Uint8Array([1, 2, 3])], "full-track.mp3", {
      type: "audio/mpeg",
    });

    const output = await processAudioForUpload(input, 2, 7);

    expect(mockDecodeAudioData).toHaveBeenCalled();
    expect(output).toBeInstanceOf(File);
    expect(output.name).toBe("full-track-clip.wav");
    expect(output.type).toBe("audio/wav");

    // 5 seconds mono 16-bit @ 44100Hz + 44-byte header
    expect(output.size).toBe(44 + 44100 * 5 * 2);
  });

  it("throws when Web Audio is unavailable", async () => {
    const original = globalThis.AudioContext;
    // @ts-expect-error -- simulate missing Web Audio
    globalThis.AudioContext = undefined;

    await expect(
      processAudioForUpload(new File([], "x.mp3"), 0, 5),
    ).rejects.toThrow("Web Audio API is not available");

    globalThis.AudioContext = original;
  });
});
