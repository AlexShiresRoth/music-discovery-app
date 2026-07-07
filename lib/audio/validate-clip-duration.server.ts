import "server-only";

import {
  clipDurationErrorMessage,
  isValidClipDuration,
} from "@/lib/audio/song-clip-duration";

const MPEG_LAYERS = [0, 3, 2, 1] as const;

const BITRATES = {
  V1L1: [
    0, 32, 64, 96, 128, 160, 192, 224, 256, 288, 320, 352, 384, 416, 448,
  ],
  V1L2: [0, 32, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 384],
  V1L3: [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320],
  V2L1: [
    0, 32, 48, 56, 64, 80, 96, 112, 128, 144, 160, 176, 192, 224, 256,
  ],
  V2L2: [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160],
  V2L3: [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160],
} as const;

const SAMPLE_RATES = {
  V1: [44100, 48000, 32000],
  V2: [22050, 24000, 16000],
  V25: [11025, 12000, 8000],
} as const;

const SAMPLES_PER_FRAME = {
  V1L1: 384,
  V1L2: 1152,
  V1L3: 1152,
  V2L1: 384,
  V2L2: 1152,
  V2L3: 576,
} as const;

function parseWavDuration(buffer: Buffer): number | null {
  if (buffer.length < 44) return null;
  if (buffer.toString("ascii", 0, 4) !== "RIFF") return null;
  if (buffer.toString("ascii", 8, 12) !== "WAVE") return null;

  let offset = 12;
  let byteRate: number | null = null;
  let dataSize: number | null = null;

  while (offset + 8 <= buffer.length) {
    const chunkId = buffer.toString("ascii", offset, offset + 4);
    const chunkSize = buffer.readUInt32LE(offset + 4);
    const chunkStart = offset + 8;

    if (chunkId === "fmt " && chunkStart + 12 <= buffer.length) {
      byteRate = buffer.readUInt32LE(chunkStart + 8);
    } else if (chunkId === "data") {
      dataSize = chunkSize;
    }

    offset = chunkStart + chunkSize + (chunkSize % 2);
  }

  if (!byteRate || !dataSize) return null;
  return dataSize / byteRate;
}

function getMp3FrameLength(buffer: Buffer, offset: number) {
  if (offset + 4 > buffer.length) return null;

  const header = buffer.readUInt32BE(offset);
  if ((header & 0xffe00000) !== 0xffe00000) return null;

  const versionBits = (header >> 19) & 0b11;
  const layerBits = (header >> 17) & 0b11;
  const bitrateIndex = (header >> 12) & 0b1111;
  const sampleRateIndex = (header >> 10) & 0b11;
  const paddingBit = (header >> 9) & 0b1;

  if (versionBits === 1 || layerBits === 0 || bitrateIndex === 0 || bitrateIndex === 15) {
    return null;
  }

  const version = versionBits === 3 ? 1 : versionBits === 2 ? 2 : 0;
  const layer = MPEG_LAYERS[layerBits];
  if (!layer) return null;

  const layerKey = `L${layer}` as "L1" | "L2" | "L3";
  const bitrateKey =
    `${version === 1 ? "V1" : "V2"}${layerKey}` as keyof typeof BITRATES;

  const bitrates = BITRATES[bitrateKey];
  const sampleRates =
    version === 1
      ? SAMPLE_RATES.V1
      : version === 2
        ? SAMPLE_RATES.V2
        : SAMPLE_RATES.V25;

  const bitrate = bitrates[bitrateIndex];
  const sampleRate = sampleRates[sampleRateIndex];
  if (!bitrate || !sampleRate) return null;

  const samplesPerFrame =
    SAMPLES_PER_FRAME[
      `${version === 1 ? "V1" : "V2"}${layerKey}` as keyof typeof SAMPLES_PER_FRAME
    ];

  const frameLength = Math.floor(
    (samplesPerFrame / 8) * (bitrate * 1000) / sampleRate + paddingBit,
  );

  if (!Number.isFinite(frameLength) || frameLength < 4) return null;

  return { frameLength, sampleRate, samplesPerFrame };
}

function parseMp3Duration(buffer: Buffer): number | null {
  let offset = 0;
  let totalSamples = 0;
  let sampleRate: number | null = null;
  let frames = 0;

  while (offset + 4 < buffer.length && frames < 10_000) {
    const frame = getMp3FrameLength(buffer, offset);
    if (!frame) {
      offset += 1;
      continue;
    }

    totalSamples += frame.samplesPerFrame;
    sampleRate = frame.sampleRate;
    offset += frame.frameLength;
    frames += 1;
  }

  if (!sampleRate || totalSamples === 0) return null;
  return totalSamples / sampleRate;
}

function parseAudioDuration(buffer: Buffer, mimeType: string): number | null {
  if (mimeType.includes("wav") || mimeType.includes("wave")) {
    return parseWavDuration(buffer);
  }

  if (
    mimeType.includes("mpeg") ||
    mimeType.includes("mp3") ||
    buffer[0] === 0xff &&
      (buffer[1] & 0xe0) === 0xe0
  ) {
    return parseMp3Duration(buffer);
  }

  return parseWavDuration(buffer) ?? parseMp3Duration(buffer);
}

export async function getAudioDurationFromFile(file: File): Promise<number | null> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return parseAudioDuration(buffer, file.type);
}

export async function validateClipDuration(file: File) {
  const duration = await getAudioDurationFromFile(file);

  if (duration === null) {
    return {
      valid: false as const,
      error: `${file.name}: Could not verify clip duration. Use mp3 or wav.`,
    };
  }

  if (!isValidClipDuration(duration)) {
    return {
      valid: false as const,
      error: clipDurationErrorMessage(file.name),
    };
  }

  return { valid: true as const, duration };
}
