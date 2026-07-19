function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/**
 *
 * @param audioBuffer
 * @param start
 * @param end
 * @returns start and end sample indexes based on start and end seconds from selection
 */
export async function convertTimeToSampleIndexes(
  audioBuffer: AudioBuffer,
  start: number,
  end: number,
) {
  const startSample = clamp(
    Math.floor(start * audioBuffer.sampleRate),
    0,
    audioBuffer.length,
  );
  const endSample = clamp(
    Math.floor(end * audioBuffer.sampleRate),
    0,
    audioBuffer.length,
  );

  return { startSample, endSample };
}

/**
 *
 * @param originalBuffer
 * @param startSeconds
 * @param endSeconds
 * @returns trimmed audio buffer based on start and end seconds from selection
 */
export function sliceAudioBuffer(
  originalBuffer: AudioBuffer,
  startSample: number,
  endSample: number,
) {
  const sampleRate = originalBuffer.sampleRate;
  const length = endSample - startSample;
  const numberOfChannels = originalBuffer.numberOfChannels;
  const slicedBuffer = new AudioBuffer({
    length,
    sampleRate,
    numberOfChannels,
  });

  for (let i = 0; i < numberOfChannels; i++) {
    slicedBuffer.copyToChannel(
      originalBuffer.getChannelData(i).subarray(startSample, endSample),
      i,
    );
  }

  return slicedBuffer;
}

/**
 * Step 3 — Encode (AudioBuffer → .wav File)
 *
 * WAV file layout:
 *   [44-byte header][PCM sample bytes]
 *
 * We downmix to mono 16-bit PCM so a ~30s clip stays well under Vercel's
 * 4.5MB body limit (stereo 16-bit 44.1kHz × 30s is ~5MB).
 */
export function encodeAudioBuffer(
  audioBuffer: AudioBuffer,
  fileName: string,
): File {
  const sampleRate = audioBuffer.sampleRate;
  const frameCount = audioBuffer.length;
  const channels = audioBuffer.numberOfChannels;

  // --- 1) Downmix float samples to a single mono Float32Array ---
  const mono = new Float32Array(frameCount);
  for (let ch = 0; ch < channels; ch++) {
    const data = audioBuffer.getChannelData(ch);
    for (let i = 0; i < frameCount; i++) {
      mono[i]! += data[i]! / channels;
    }
  }

  // --- 2) Allocate bytes: 44 header + 2 bytes per sample (16-bit) ---
  const bytesPerSample = 2;
  const dataSize = frameCount * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // Helper to write ASCII tags like "RIFF", "WAVE"
  const writeString = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i++) {
      view.setUint8(offset + i, text.charCodeAt(i));
    }
  };

  // --- 3) RIFF / WAV header (little-endian) ---
  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true); // file size minus first 8 bytes
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true); // PCM fmt chunk size
  view.setUint16(20, 1, true); // format = 1 (PCM)
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * bytesPerSample, true); // byte rate
  view.setUint16(32, bytesPerSample, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  // --- 4) Float [-1, 1] → Int16, write after the header ---
  let offset = 44;
  for (let i = 0; i < frameCount; i++) {
    const sample = Math.max(-1, Math.min(1, mono[i]!));
    const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    view.setInt16(offset, int16, true);
    offset += 2;
  }

  const safeName = fileName.replace(/\.[^.]+$/, "") || "clip";
  return new File([buffer], `${safeName}-clip.wav`, {
    type: "audio/wav",
    lastModified: Date.now(),
  });
}
/**
 *
 *
 * A File is compressed bytes (mp3, wav, etc). The Web Audio API can't slice
 * that directly. decodeAudioData expands it into an AudioBuffer: raw PCM
 * samples you can index by time.
 *
 * Flow:
 *   File → ArrayBuffer → AudioContext.decodeAudioData → AudioBuffer
 */
async function decodeAudioFile(file: File): Promise<{
  audioContext: AudioContext;
  buffer: AudioBuffer;
}> {
  if (typeof AudioContext === "undefined") {
    throw new Error("Web Audio API is not available in this environment");
  }

  // AudioContext is the browser's audio engine for this page.
  const audioContext = new AudioContext();

  // Read the whole file into memory as raw bytes.
  const arrayBuffer = await file.arrayBuffer();

  // decodeAudioData may detach (empty) the ArrayBuffer it receives, so we
  // pass a copy with .slice(0). After this, `buffer` has:
  // - sampleRate (e.g. 44100)
  // - numberOfChannels (1 = mono, 2 = stereo)
  // - length (total samples per channel)
  // - duration (seconds) ≈ length / sampleRate
  // - getChannelData(channel) → Float32Array of samples in [-1, 1]
  const buffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));

  return { audioContext, buffer };
}

export async function processAudioForUpload(
  file: File,
  start: number,
  end: number,
): Promise<File> {
  const { buffer } = await decodeAudioFile(file);
  const { startSample, endSample } = await convertTimeToSampleIndexes(
    buffer,
    start,
    end,
  );
  const slicedBuffer = sliceAudioBuffer(buffer, startSample, endSample);
  return encodeAudioBuffer(slicedBuffer, file.name);
}
