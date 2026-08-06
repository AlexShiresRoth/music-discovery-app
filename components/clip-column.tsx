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
    <div className="flex flex-col gap-8 w-full justify-start">
      <div
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-4"
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
