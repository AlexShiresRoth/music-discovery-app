"use client";

import { MAX_SONG_CLIP_DURATION_SECONDS } from "@/app/profile/schemas";
import { useFeedAudio } from "@/context/feed-audio";
import clsx from "clsx";
import {
  Fullscreen,
  Music2,
  Pause,
  Play,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import HoverPlugin from "wavesurfer.js/dist/plugins/hover.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.js";
import ActionButton from "./action-button";
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
const REGION_EDITOR_HEIGHT = 160;
const REGION_EDITOR_FULLSCREEN_HEIGHT = 280;
/** Zoom so a max-length clip fills most of the view and is easy to drag. */
const REGION_VIEWPORT_FILL = 0.7;
/** Tracks longer than this get a zoomed clip view + overview toggle. */
const LONG_TRACK_SECONDS =
  MAX_SONG_CLIP_DURATION_SECONDS / REGION_VIEWPORT_FILL;

function fitWaveformWidth(ws: WaveSurfer) {
  const width = ws.getWidth();
  const duration = ws.getDuration();
  if (!width || !duration) return;
  ws.zoom(width / duration);
  ws.setScrollTime(0);
}

function zoomClipEditor(ws: WaveSurfer, region?: ClipSelection | null) {
  const width = ws.getWidth();
  if (!width) return;

  const duration = ws.getDuration();
  if (!duration) return;

  const visibleSeconds = Math.min(
    duration,
    MAX_SONG_CLIP_DURATION_SECONDS / REGION_VIEWPORT_FILL,
  );
  ws.zoom(width / visibleSeconds);

  if (region) {
    const padding = Math.max(
      0,
      (visibleSeconds - (region.end - region.start)) / 2,
    );
    ws.setScrollTime(Math.max(0, region.start - padding));
  }
}

function editorHelpText(duration: number, showOverview: boolean) {
  if (!duration) {
    return `Drag the highlighted region (up to ${MAX_SONG_CLIP_DURATION_SECONDS}s).`;
  }
  if (duration <= LONG_TRACK_SECONDS) {
    return `Drag the highlighted region to choose up to ${MAX_SONG_CLIP_DURATION_SECONDS}s.`;
  }
  if (showOverview) {
    return "Overview of the full track — zoom in to fine-tune the clip region.";
  }
  return `Scroll to find a section, then drag the highlighted region (up to ${MAX_SONG_CLIP_DURATION_SECONDS}s).`;
}

/** Ensures only one WaveSurfer instance plays at a time on the page. */
let activePlayer: WaveSurfer | null = null;

function claimSoloPlayback(ws: WaveSurfer) {
  if (activePlayer && activePlayer !== ws) {
    activePlayer.pause();
  }
  activePlayer = ws;
}

function releaseSoloPlayback(ws: WaveSurfer) {
  if (activePlayer === ws) {
    activePlayer = null;
  }
}

function formatClipTime(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  return `${String(s).padStart(2, "0")}s`;
}

function WaveSurferBasic({
  url,
  isActive,
  isOnFeed,
  onFinish,
  clipName,
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
    const unsubPlay = ws.on("play", () => {
      claimSoloPlayback(ws);
      if (!isOnFeed) setLocalPlaying(true);
    });
    const unsubPause = ws.on("pause", () => {
      releaseSoloPlayback(ws);
      if (!isOnFeed) setLocalPlaying(false);
    });
    const unsubFinish = ws.on("finish", () => {
      releaseSoloPlayback(ws);
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
      releaseSoloPlayback(ws);
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
          <div className="flex items-center gap-2">
            <p>
              {clipName.length > 30
                ? clipName.substring(0, 30) + "..."
                : clipName}
            </p>
            <p className="text-gray-400 text-xs">{formatClipTime(duration)}</p>
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
  const loadIdRef = useRef(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showOverview, setShowOverview] = useState(false);
  const [duration, setDuration] = useState(0);
  const isLongTrack = duration > LONG_TRACK_SECONDS;

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
      height: REGION_EDITOR_HEIGHT,
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
    });

    const unsubUpdated = regions.on("region-updated", (region) => {
      onSelectionChangeRef.current({ start: region.start, end: region.end });
    });

    const unsubPlay = ws.on("play", () => {
      claimSoloPlayback(ws);
      setIsPlaying(true);
    });
    const unsubPause = ws.on("pause", () => {
      releaseSoloPlayback(ws);
      setIsPlaying(false);
    });
    const unsubFinish = ws.on("finish", () => {
      releaseSoloPlayback(ws);
      setIsPlaying(false);
    });

    return () => {
      disableDragSelection();
      unsubCreated();
      unsubUpdated();
      unsubPlay();
      unsubPause();
      unsubFinish();
      releaseSoloPlayback(ws);
      ws.destroy();
      wsRef.current = null;
      regionsRef.current = null;
    };
  }, []);

  // Grow/reflow the waveform when fullscreen or overview mode changes
  useEffect(() => {
    const ws = wsRef.current;
    if (!ws || !isReady) return;

    const frame = requestAnimationFrame(() => {
      ws.setOptions({
        height: isFullscreen
          ? REGION_EDITOR_FULLSCREEN_HEIGHT
          : REGION_EDITOR_HEIGHT,
      });
      if (showOverview) {
        fitWaveformWidth(ws);
      } else {
        zoomClipEditor(ws, selectedRegionRef.current);
      }
    });

    return () => cancelAnimationFrame(frame);
  }, [isFullscreen, isReady, showOverview]);

  useEffect(() => {
    if (!isFullscreen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isFullscreen]);

  // Load audio whenever the file changes
  useEffect(() => {
    const ws = wsRef.current;
    const regions = regionsRef.current;
    if (!ws || !regions || !file) return;

    const loadId = ++loadIdRef.current;
    setIsReady(false);
    setShowOverview(false);
    setDuration(0);

    void ws.loadBlob(file).then(() => {
      if (loadId !== loadIdRef.current) return;

      regions.clearRegions();

      const nextDuration = ws.getDuration();
      const end = Math.min(MAX_SONG_CLIP_DURATION_SECONDS, nextDuration);
      const existing = selectedRegionRef.current;
      const region = {
        start: existing?.start ?? 0,
        end: existing?.end ?? end,
      };

      regions.addRegion({
        ...region,
        resize: true,
        drag: true,
        color: "rgba(255, 255, 255, 0.5)",
        minLength: 5,
        maxLength: MAX_SONG_CLIP_DURATION_SECONDS,
      });

      setDuration(nextDuration);
      zoomClipEditor(ws, region);
      setIsReady(true);
    });
  }, [file]);

  return (
    <div
      className={clsx(
        "wave-region-editor flex flex-col gap-4 border rounded-md p-4 w-full min-w-0",
        isFullscreen &&
          "fixed inset-0 z-99999 h-dvh max-h-dvh w-screen rounded-none border-0 bg-background overflow-auto pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]",
      )}
    >
      <div className="flex flex-wrap items-center gap-2 border-b pb-4">
        <ActionButton
          type="button"
          aria-label={isFullscreen ? "Exit larger editor" : "Enlarge editor"}
          className="hover:cursor-pointer p-1 rounded transition-colors shrink-0 text-xs"
          onClick={() => setIsFullscreen((fullscreen) => !fullscreen)}
        >
          {!isFullscreen ? (
            <div className="flex items-center gap-2">
              <Fullscreen className="w-4 h-4" /> <p>Fullscreen editor</p>
            </div>
          ) : (
            <div className="flex items-center gap-2 ">
              <X className="w-4 h-4" /> <p>Exit fullscreen editor</p>
            </div>
          )}
        </ActionButton>
        {isLongTrack && (
          <ActionButton
            type="button"
            className="text-xs"
            onClick={() => setShowOverview((overview) => !overview)}
          >
            {showOverview ? "Zoom to clip" : "Show full track"}
          </ActionButton>
        )}
      </div>
      <div className="flex flex-col justify-between gap-2">
        <p className="text-sm">{editorHelpText(duration, showOverview)}</p>
      </div>
      {/* Avoid touch-none in the inline editor so the page can still scroll;
          fullscreen already locks body scroll while editing. */}
      <div
        ref={containerRef}
        className={clsx("w-full min-w-0", isFullscreen && "touch-none")}
      />
      <div className="flex items-center justify-between border-t pt-4 gap-3">
        <p className="text-base truncate flex items-center gap-2 min-w-0">
          <Music2 className="w-4 h-4 shrink-0" /> {file.name}
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm text-gray-500">Preview</span>
          <button
            type="button"
            onClick={playAndPause}
            disabled={!isReady}
            aria-label={isPlaying ? "Pause clip preview" : "Play clip preview"}
            className="hover:cursor-pointer bg-black text-white w-8 h-8 flex items-center justify-center rounded-full transition-colors disabled:opacity-40"
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
        </div>
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
