"use client";

import { MAX_SONG_CLIP_DURATION_SECONDS } from "@/app/profile/schemas";
import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
};

const WAVE_COLOR = "rgba(255, 255, 255, 0.5)";

function WaveSurferBasic({ url, clipName }: { url: string; clipName: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playAndPause = () => {
    wsRef.current?.playPause();
  };

  useEffect(() => {
    if (!containerRef.current || !url) return;

    const hover = HoverPlugin.create();
    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: WAVE_COLOR,
      progressColor: "purple",
      height: 100,
      plugins: [hover],
      url,
    });

    wsRef.current = ws;

    const unsubPlay = ws.on("play", () => setIsPlaying(true));
    const unsubPause = ws.on("pause", () => setIsPlaying(false));
    const unsubFinish = ws.on("finish", () => setIsPlaying(false));

    return () => {
      unsubPlay();
      unsubPause();
      unsubFinish();
      ws.destroy();
      wsRef.current = null;
    };
  }, [url]);

  return (
    <div className="flex flex-col gap-2 border border-gray-400/40 rounded-md p-4">
      <div ref={containerRef} className="w-full" />
      <div className="flex items-center gap-2 border-t border-gray-400/40 pt-2 text-sm">
        <button
          type="button"
          onClick={playAndPause}
          className="hover:cursor-pointer hover:bg-white/10 p-1 rounded transition-colors"
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
        </button>
        <p>{clipName}</p>
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
      progressColor: "purple",
      height: 100,
      plugins: [regions, hover],
    });

    wsRef.current = ws;
    regionsRef.current = regions;

    const disableDragSelection = regions.enableDragSelection({
      color: "rgba(255, 165, 0, 0.35)",
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
        color: "rgba(99,102,241,0.5)",
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
    <div className="flex flex-col gap-2 border border-gray-400/40 rounded-md p-4">
      <p className="text-sm text-gray-400/80">
        Drag the region to select up to {MAX_SONG_CLIP_DURATION_SECONDS}s
      </p>
      <div ref={containerRef} className="w-full" />
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
}: Props) {
  if (url) {
    return <WaveSurferBasic url={url} clipName={clipName || ""} />;
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
