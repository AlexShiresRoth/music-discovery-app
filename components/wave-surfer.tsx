"use client";

import { MAX_SONG_CLIP_DURATION_SECONDS } from "@/app/profile/schemas";
import { useFeedAudio } from "@/context/feed-audio";
import clsx from "clsx";
import { Loader2, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import HoverPlugin from "wavesurfer.js/dist/plugins/hover.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.js";

type ClipSelection = {
  start: number;
  end: number;
};

type Props = {
  onSelectionChange?: (selection: ClipSelection | null) => void;
  file?: File | null;
  selectedRegion?: ClipSelection | null | undefined;
  url?: string;
  clipName?: string;
  isActive?: boolean;
  isOnFeed?: boolean;
  fullSongUrl?: string;
};

const WAVE_COLOR = "#FACE85";
const PROGRESS_COLOR = "black";

function WaveSurferBasic({
  url,
  clipName,
  isActive,
  isOnFeed,
  fullSongUrl,
}: {
  url: string;
  clipName: string;
  isActive?: boolean;
  isOnFeed?: boolean;
  fullSongUrl?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WaveSurfer | null>(null);
  const { isMuted: feedMuted, isPlaying: feedPlaying } = useFeedAudio();
  const [localPlaying, setLocalPlaying] = useState(false);
  const [localMuted, setLocalMuted] = useState(false);
  const isMuted = isOnFeed ? feedMuted : localMuted;
  const isPlaying = isOnFeed ? feedPlaying : localPlaying;
  const isActiveRef = useRef(isActive ?? false);
  const isMutedRef = useRef(isMuted);
  const isPlayingRef = useRef(isPlaying);
  const [isLoading, setIsLoading] = useState(true);

  const shouldPlay = useCallback(() => {
    if (isOnFeed) {
      return isActiveRef.current && isPlayingRef.current;
    }
    return isPlayingRef.current;
  }, [isOnFeed]);

  useEffect(() => {
    isActiveRef.current = isActive ?? false;
  }, [isActive]);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const syncPlayback = useCallback(() => {
    const ws = wsRef.current;
    if (!ws) return;

    if (!shouldPlay()) {
      ws.pause();
      return;
    }

    if (ws.getDuration() > 0) {
      void ws.play();
    }
  }, [shouldPlay]);

  const playAndPause = () => {
    const ws = wsRef.current;
    if (!ws) return;

    if (ws.isPlaying()) {
      ws.pause();
      return;
    }

    void ws.play();
  };

  useEffect(() => {
    if (!containerRef.current || !url) return;

    const hover = HoverPlugin.create();
    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: WAVE_COLOR,
      progressColor: PROGRESS_COLOR,
      height: 100,
      plugins: [hover],
      url,
    });

    ws.setMuted(isMutedRef.current);
    wsRef.current = ws;

    const unsubReady = ws.on("ready", () => {
      if (shouldPlay()) {
        void ws.play();
      }
    });

    const unsubPlay = isOnFeed
      ? () => {}
      : ws.on("play", () => setLocalPlaying(true));
    const unsubPause = isOnFeed
      ? () => {}
      : ws.on("pause", () => setLocalPlaying(false));
    const unsubFinish = isOnFeed
      ? () => {}
      : ws.on("finish", () => setLocalPlaying(false));

    return () => {
      unsubReady();
      unsubPlay();
      unsubPause();
      unsubFinish();
      ws.destroy();
      wsRef.current = null;
    };
  }, [url, shouldPlay, isOnFeed]);

  useEffect(() => {
    wsRef.current?.setMuted(isMuted);
  }, [isMuted]);

  useEffect(() => {
    if (!isOnFeed) return;

    syncPlayback();

    const ws = wsRef.current;
    if (!ws || ws.getDuration() > 0) return;

    const unsubReady = ws.on("ready", () => {
      syncPlayback();
      setIsLoading(false);
    });
    return () => unsubReady();
  }, [isOnFeed, isActive, isPlaying, syncPlayback]);

  // TODO - add a loading state to the wave surfer
  // TODO - add modal to play button on first visitx
  return (
    <div className="flex flex-col gap-2 border rounded-md p-4 w-full min-w-0">
      <div ref={containerRef} className="w-full min-w-0 min-h-24 md:min-h-32">
        {isLoading && !wsRef ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="animate-spin" size={32} />
          </div>
        ) : (
          <></>
        )}
      </div>
      <div className="flex justify-between items-center gap-2 border-t pt-2 text-sm">
        {!isOnFeed && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={playAndPause}
              className="hover:cursor-pointer hover:bg-white/10 p-1 rounded transition-colors"
              aria-label={localPlaying ? "Pause clip" : "Play clip"}
            >
              {localPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button
              type="button"
              onClick={() => setLocalMuted((muted) => !muted)}
              className="hover:cursor-pointer hover:bg-white/10 p-1 rounded transition-colors"
              aria-label={localMuted ? "Unmute clip" : "Mute clip"}
            >
              {localMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          </div>
        )}
        <p className={clsx("text-sm truncate", isOnFeed && "text-xl")}>
          {clipName}
        </p>
        {fullSongUrl && (
          <a
            href={fullSongUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm hover:cursor-pointer hover:text-gray-500 transition-colors"
          >
            Listen to full song
          </a>
        )}
      </div>
    </div>
  );
}

function WaveSurferWithRegions({
  file,
  onSelectionChange,
  selectedRegion,
}: {
  onSelectionChange: (selection: ClipSelection | null) => void;
  file: File;
  selectedRegion?: ClipSelection | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WaveSurfer | null>(null);
  const regionsRef = useRef<RegionsPlugin | null>(null);
  const onSelectionChangeRef = useRef(onSelectionChange);
  const selectedRegionRef = useRef(selectedRegion);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    onSelectionChangeRef.current = onSelectionChange;
  }, [onSelectionChange]);

  useEffect(() => {
    selectedRegionRef.current = selectedRegion;
  }, [selectedRegion]);

  const playAndPause = () => {
    const ws = wsRef.current;
    if (!ws) return;

    if (ws.isPlaying()) {
      ws.pause();
      return;
    }

    const region = selectedRegionRef.current;
    if (region) {
      void ws.play(region.start, region.end);
    } else {
      void ws.play();
    }
  };

  // Create WaveSurfer once for this mount
  useEffect(() => {
    if (!containerRef.current) return;

    const regions = RegionsPlugin.create();
    const hover = HoverPlugin.create();
    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: WAVE_COLOR,
      progressColor: PROGRESS_COLOR,
      height: 100,
      plugins: [regions, hover],
    });

    wsRef.current = ws;
    regionsRef.current = regions;

    const disableDragSelection = regions.enableDragSelection({
      color: "rgba(255, 255, 255, 0.35)",
      minLength: 5,
      maxLength: MAX_SONG_CLIP_DURATION_SECONDS,
    });

    const unsubCreated = regions.on("region-created", (region) => {
      regions.getRegions().forEach((r) => {
        if (r.id !== region.id) r.remove();
      });
      onSelectionChangeRef.current({ start: region.start, end: region.end });
      void region.play(true);
    });

    const unsubUpdated = regions.on("region-updated", (region) => {
      onSelectionChangeRef.current({ start: region.start, end: region.end });
      void region.play(true);
    });

    const unsubPlay = ws.on("play", () => setIsPlaying(true));
    const unsubPause = ws.on("pause", () => setIsPlaying(false));
    const unsubFinish = ws.on("finish", () => setIsPlaying(false));

    return () => {
      disableDragSelection();
      unsubCreated();
      unsubUpdated();
      unsubPlay();
      unsubPause();
      unsubFinish();
      ws.destroy();
      wsRef.current = null;
      regionsRef.current = null;
    };
  }, []);

  // Load audio whenever the file changes
  useEffect(() => {
    const ws = wsRef.current;
    const regions = regionsRef.current;
    if (!ws || !regions || !file) return;

    let cancelled = false;
    setIsReady(false);

    void ws.loadBlob(file).then(() => {
      if (cancelled) return;

      regions.clearRegions();

      const duration = ws.getDuration();
      const end = Math.min(MAX_SONG_CLIP_DURATION_SECONDS, duration);
      const existing = selectedRegionRef.current;

      regions.addRegion({
        start: existing?.start ?? 0,
        end: existing?.end ?? end,
        resize: true,
        drag: true,
        color: "rgba(255, 255, 255, 0.5)",
        minLength: 5,
        maxLength: MAX_SONG_CLIP_DURATION_SECONDS,
      });

      setIsReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [file]);

  return (
    <div className="flex flex-col gap-2 border rounded-md p-4 w-full min-w-0">
      <p className="text-sm text-gray-400/80">
        Drag the region to select up to {MAX_SONG_CLIP_DURATION_SECONDS}s
      </p>
      <div ref={containerRef} className="w-full min-w-0" />
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={playAndPause}
          disabled={!isReady}
          className="hover:cursor-pointer hover:bg-white/10 p-1 rounded transition-colors disabled:opacity-40"
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <p className="text-sm truncate">{file.name}</p>
      </div>
    </div>
  );
}

export default function WaveSurferUI({
  file,
  onSelectionChange,
  selectedRegion,
  url,
  clipName,
  isActive,
  isOnFeed,
  fullSongUrl,
}: Props) {
  if (url) {
    return (
      <WaveSurferBasic
        isOnFeed={isOnFeed}
        url={url}
        clipName={clipName || ""}
        isActive={isActive}
        fullSongUrl={fullSongUrl}
      />
    );
  }

  if (!file || !onSelectionChange) return null;

  return (
    <WaveSurferWithRegions
      file={file}
      onSelectionChange={onSelectionChange}
      selectedRegion={selectedRegion}
    />
  );
}
