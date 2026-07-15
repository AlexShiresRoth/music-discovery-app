export type ClipSelection = {
  start: number;
  end: number;
};

export type ClipSlotDraft = {
  id?: number;
  file: File | null;
  fileName: string;
  title: string;
  fullSongUrl: string;
  dbUrl?: string | null;
  selectedRegion?: ClipSelection | null;
};

export type ClipUploadMetadata = {
  index: number;
  title: string;
  fullSongUrl: string;
  selectedRegion: ClipSelection | null;
};
