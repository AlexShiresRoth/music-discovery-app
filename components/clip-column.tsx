import { SongClipWithProfile } from "@/lib/db/types";
import clsx from "clsx";
import ClipDisplay from "./clip-display";

type Props = {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  songClips: SongClipWithProfile[];
  clipIndex: number;
  setClipIndex: (index: number) => void;
  scrollToClip: (index: number) => void;
  activeProfileIndex: number;
  currentIndex: number;
  handleAdvancePlayback: () => void;
};
export default function ClipColumn({
  scrollRef,
  songClips,
  clipIndex,
  setClipIndex,
  scrollToClip,
  activeProfileIndex,
  currentIndex,
  handleAdvancePlayback,
}: Props) {
  return (
    <div className="flex min-h-0 w-full flex-1 flex-col justify-start gap-8">
      <div
        ref={scrollRef}
        className="flex min-h-0 flex-1 gap-4 overflow-x-auto overflow-y-visible snap-x snap-mandatory scrollbar-none"
      >
        {songClips.map((clip, index) => (
          <ClipDisplay
            key={clip.id}
            clip={clip}
            index={index}
            isActive={
              clipIndex === index && activeProfileIndex === currentIndex
            }
            onFinish={handleAdvancePlayback}
          />
        ))}
      </div>
      <div className="flex justify-center gap-2">
        {Array.from({ length: songClips.length }).map((_, index) => (
          <button
            key={index}
            type="button"
            aria-label={`Go to clip ${index + 1}`}
            onClick={() => {
              setClipIndex(index);
              scrollToClip(index);
            }}
            className="hover:cursor-pointer hover:scale-110 transition-all duration-300"
          >
            <span
              className={clsx(
                "w-2 h-2 block rounded-full transition-all duration-300",
                clipIndex === index ? "bg-amber-500/30" : "bg-black",
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
