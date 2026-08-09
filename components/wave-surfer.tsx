"use client";

import { MAX_SONG_CLIP_DURATION_SECONDS } from "@/app/profile/schemas";
import { useFeedAudio } from "@/context/feed-audio";
import clsx from "clsx";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import HoverPlugin from "wavesurfer.js/dist/plugins/hover.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.js";
import WaveformSkeleton from "./wave-form-skeleton";

type ClipSelection = {
  start: number;
  end: number;
};

type Props = {
  genre?: string;
  genreFilterUrl?: string;
  onSelectionChange?: (selection: ClipSelection | null) => void;
  file?: File | null;
  selectedRegion?: ClipSelection | null | undefined;
  url?: string;
  clipName?: string;
  isActive?: boolean;
  isOnFeed?: boolean;
  fullSongUrl?: string;
  onFinish?: () => void;
};

const WAVE_COLOR = "#FACE85";
const PROGRESS_COLOR = "black";
const FADE_SECONDS = 1;

function formatClipTime(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  return `:${String(s).padStart(2, "0")}s`;
}

function WaveSurferBasic({
  url,
  isActive,
  isOnFeed,
  onFinish,
}: {
  url: string;
  clipName: string;
  genre?: string;
  genreFilterUrl?: string;
  isActive?: boolean;
  isOnFeed?: boolean;
  fullSongUrl?: string;
  onFinish?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WaveSurfer | null>(null);
  const timeCurrentRef = useRef<HTMLParagraphElement>(null);
  const {
    isMuted: feedMuted,
    isPlaying: feedPlaying,
    setCanPlay,
  } = useFeedAudio();
  const [localPlaying, setLocalPlaying] = useState(false);
  const [localMuted, setLocalMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const isMuted = isOnFeed ? feedMuted : localMuted;
  const isPlaying = isOnFeed ? feedPlaying : localPlaying;
  const isActiveRef = useRef(isActive ?? false);
  const wasActiveRef = useRef(isActive ?? false);
  const isMutedRef = useRef(isMuted);
  const isPlayingRef = useRef(isPlaying);
  const setCanPlayRef = useRef(setCanPlay);
  const onFinishRef = useRef(onFinish);
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

    const active = isActiveRef.current;
    const becameActive = Boolean(isOnFeed && active && !wasActiveRef.current);
    wasActiveRef.current = active;

    if (!shouldPlay()) {
      ws.pause();
      // Reset so the next time this clip is selected it starts clean.
      if (isOnFeed && !active) {
        ws.setTime(0);
      }
      return;
    }

    if (ws.getDuration() > 0) {
      if (becameActive) {
        ws.setTime(0);
      }
      void ws.play();
    }
  }, [shouldPlay, isOnFeed]);

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
    setCanPlayRef.current = setCanPlay;
  }, [setCanPlay]);

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    if (!containerRef.current || !url) return;

    setIsLoading(true);

    const hover = HoverPlugin.create();
    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: WAVE_COLOR,
      progressColor: PROGRESS_COLOR,
      height: "auto",
      normalize: true,
      plugins: [hover],
      barWidth: 3,
      barRadius: 10,
      barGap: 4,
      url,
    });
    ws.setMuted(isMutedRef.current);
    wsRef.current = ws;

    const unsubReady = ws.on("ready", () => {
      setIsLoading(false);
      setCanPlayRef.current(true);
      setDuration(ws.getDuration());
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
    const unsubFinish = ws.on("finish", () => {
      if (isOnFeed) {
        // Only the active clip should advance the playlist.
        if (isActiveRef.current && isPlayingRef.current) {
          onFinishRef.current?.();
        }
        return;
      }
      setLocalPlaying(false);
    });
    const unsubTimeupdate = ws.on("timeupdate", () => {
      if (ws.getMuted() && !isOnFeed) return;
      const currentTime = ws.getCurrentTime();
      const clipDuration = ws.getDuration();
      const remainingDuration = clipDuration - FADE_SECONDS;
      const volume = currentTime / FADE_SECONDS;
      if (currentTime < FADE_SECONDS) {
        ws.setVolume(volume);
      }
      if (currentTime > remainingDuration && currentTime < clipDuration) {
        ws.setVolume(1 - (currentTime - remainingDuration) / FADE_SECONDS);
      }
      if (timeCurrentRef.current) {
        timeCurrentRef.current.textContent = formatClipTime(currentTime);
      }
    });

    return () => {
      unsubReady();
      unsubPlay();
      unsubPause();
      unsubFinish();
      unsubTimeupdate();
      ws.destroy();
      wsRef.current = null;
    };
    // Keep this effect tied to url only — recreating on feed state
    // changes reloads audio and makes loading feel much slower.
  }, [url, shouldPlay, isOnFeed]);

  useEffect(() => {
    wsRef.current?.setMuted(isMuted);
  }, [isMuted]);

  useEffect(() => {
    syncPlayback();
  }, [isActive, isPlaying, syncPlayback]);

  return (
    <div
      className={clsx(
        "relative flex flex-col w-full min-w-0 h-full",
        isLoading && "animate-pulse",
      )}
    >
      <div className="relative w-full min-w-0 h-full min-h-0">
        {/* Dedicated mount node — keep React overlays out of this div */}
        <div ref={containerRef} className="w-full min-w-0 h-full" />
        {isLoading && (
          <div className="absolute top-0 left-0 h-full flex items-center justify-center w-full">
            <WaveformSkeleton />
          </div>
        )}
        {/* Hang below the wave box so time labels don't shift spindle/wave centering */}
        {isOnFeed && isActive && (
          <div className="pointer-events-none absolute top-full left-0 right-0 z-10 flex items-center justify-between pt-1">
            <p className="text-sm text-gray-400/80" ref={timeCurrentRef}>
              {formatClipTime(0)}
            </p>
            {duration > 0 && (
              <p className="text-sm text-gray-400/80">
                {formatClipTime(duration)}
              </p>
            )}
          </div>
        )}
      </div>
      {!isOnFeed && (
        <div className="flex justify-between items-center gap-2 border-t pt-2 text-sm">
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
        </div>
      )}
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
  onFinish,
  genre,
  genreFilterUrl,
}: Props) {
  if (url) {
    return (
      <WaveSurferBasic
        isOnFeed={isOnFeed}
        url={url}
        clipName={clipName || ""}
        isActive={isActive}
        fullSongUrl={fullSongUrl}
        onFinish={onFinish}
        genre={genre}
        genreFilterUrl={genreFilterUrl}
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
