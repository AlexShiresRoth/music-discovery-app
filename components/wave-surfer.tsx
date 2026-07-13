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
  onSelectionChange: (selection: ClipSelection | null) => void;
  file: File | null;
  selectedRegion: ClipSelection | null;
};

export default function WaveSurferUI({
  file,
  onSelectionChange,
  selectedRegion,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playAndPause = () => {
    if (wsRef.current && wsRef.current.isPlaying()) {
      wsRef.current.pause();
      setIsPlaying(false);
    } else {
      wsRef.current?.play(selectedRegion?.start, selectedRegion?.end);
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      const regions = RegionsPlugin.create();
      const hover = HoverPlugin.create();
      const ws = WaveSurfer.create({
        container: containerRef.current,
        waveColor: "#fff",
        progressColor: "purple",
        height: 100,
        plugins: [regions, hover],
      });

      wsRef.current = ws;

      const disableDragSelection = regions.enableDragSelection({
        color: "orange",
        minLength: 5,
        maxLength: MAX_SONG_CLIP_DURATION_SECONDS,
      });

      regions.on("region-updated", (region) => {
        region.play(true);
        setIsPlaying(true);
        onSelectionChange({ start: region.start, end: region.end });
        wsRef.current?.on("timeupdate", (currentTime) => {
          if (currentTime >= region.end) {
            setIsPlaying(false);
          }
        });
      });

      regions.on("region-created", (region) => {
        regions.getRegions().forEach((r) => {
          if (r.id !== region.id) {
            r.remove();
          }
        });
        setIsPlaying(true);
        region.play(true);
        onSelectionChange({ start: region.start, end: region.end });
        wsRef.current?.on("timeupdate", (currentTime) => {
          if (currentTime >= region.end) {
            setIsPlaying(false);
          }
        });
      });

      return () => {
        disableDragSelection();
        ws.destroy();
        wsRef.current = null;
      };
    }
  }, [file, onSelectionChange]);

  useEffect(() => {
    const ws = wsRef.current;
    if (!ws || !file) return;

    ws.loadBlob(file).then(() => {
      const regions = ws
        .getActivePlugins()
        .find((p) => p instanceof RegionsPlugin);
      regions?.clearRegions();
      regions?.addRegion({
        start: 0,
        end: MAX_SONG_CLIP_DURATION_SECONDS,
        resize: true,
        drag: true,
        color: "rgba(99,102,241,0.5)",
        minLength: 5,
        maxLength: MAX_SONG_CLIP_DURATION_SECONDS,
      });
    });

    wsRef.current?.on("finish", () => {
      setIsPlaying(false);
    });
  }, [file]);

  if (!file) return null;

  return (
    <div className="flex flex-col gap-2 border border-gray-400/40 rounded-md p-4">
      <p className="text-sm text-gray-400/80">
        Drag region to play the within the region
      </p>
      <div ref={containerRef} className="w-full min-h-10" />
      <div className="flex items-center gap-2">
        <button type="button" onClick={playAndPause}>
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <p>{file.name}</p>
      </div>
    </div>
  );
}
