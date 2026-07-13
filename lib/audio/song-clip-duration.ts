// src/lib/audio/trim-audio.ts
import ffmpegPath from "ffmpeg-static";
import { spawn } from "node:child_process";

type TrimAudioOptions = {
  inputPath: string;
  outputPath: string;
  start: number;
  end: number;
};

export function trimAudio({
  inputPath,
  outputPath,
  start,
  end,
}: TrimAudioOptions): Promise<void> {
  if (!ffmpegPath) {
    return Promise.reject(new Error("FFmpeg binary is unavailable"));
  }

  const duration = end - start;

  if (
    !Number.isFinite(start) ||
    !Number.isFinite(end) ||
    start < 0 ||
    duration < 5 ||
    duration > 30
  ) {
    return Promise.reject(new Error("Clip must be between 5 and 30 seconds"));
  }

  return new Promise((resolve, reject) => {
    const process = spawn(ffmpegPath || "", [
      "-y",

      // Seek to the selected WaveSurfer region.
      "-ss",
      String(start),

      "-i",
      inputPath,

      // Keep only the selected duration.
      "-t",
      String(duration),

      // Ignore embedded video or album-art streams.
      "-vn",

      // Produce a consistent MP3 preview.
      "-c:a",
      "libmp3lame",
      "-b:a",
      "192k",

      outputPath,
    ]);

    let stderr = "";

    process.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    process.once("error", reject);

    process.once("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`FFmpeg exited with code ${code}: ${stderr}`));
    });
  });
}
