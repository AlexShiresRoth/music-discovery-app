import { MAX_SONG_CLIP_DURATION_SECONDS } from "@/app/profile/schemas";

export function isValidClipDuration(durationSeconds: number) {
  return (
    Number.isFinite(durationSeconds) &&
    durationSeconds > 0 &&
    durationSeconds <= MAX_SONG_CLIP_DURATION_SECONDS
  );
}

export function clipDurationErrorMessage(fileName?: string) {
  const prefix = fileName ? `${fileName}: ` : "";
  return `${prefix}Clips must be ${MAX_SONG_CLIP_DURATION_SECONDS} seconds or shorter`;
}

export function getAudioDurationFromFile(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = document.createElement("audio");
    const url = URL.createObjectURL(file);

    const cleanup = () => {
      URL.revokeObjectURL(url);
      audio.removeAttribute("src");
      audio.load();
    };

    audio.preload = "metadata";
    audio.onloadedmetadata = () => {
      cleanup();
      resolve(audio.duration);
    };
    audio.onerror = () => {
      cleanup();
      reject(new Error("Could not read audio duration"));
    };
    audio.src = url;
  });
}
