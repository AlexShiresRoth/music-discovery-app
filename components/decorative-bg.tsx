import clsx from "clsx";

interface DecorativeBgProps {
  isPlaying: boolean;
}

/**
 * Keep aspect-square. Size against the clip `@container` (cqw/cqh),
 * but center it in whatever parent frames it (same box as the spindle).
 */
export default function DecorativeBg({ isPlaying }: DecorativeBgProps) {
  return (
    <div
      data-decorative-bg
      className="flex aspect-square md:w-[max(130cqw,130cqh)] w-[max(120cqw,120cqh)] shrink-0 items-center justify-center rounded-full border-2 border-gray-400/10 bg-background"
    >
      <div
        className={clsx(
          "flex h-3/4 w-3/4 items-center justify-center rounded-full border-t-2 border-gray-400/10 animate-spin [animation-duration:8s]",
          isPlaying
            ? "[animation-play-state:running]"
            : "[animation-play-state:paused]",
        )}
      >
        <div className="flex aspect-square h-[45%] w-auto max-w-full items-center justify-center rounded-full bg-gray-400/10 md:h-[25%]">
          <div className="flex h-11/12 w-11/12 items-center justify-center rounded-full border-2 border-background" />
        </div>
      </div>
    </div>
  );
}
