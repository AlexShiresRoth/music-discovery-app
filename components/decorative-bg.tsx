import clsx from "clsx";

interface DecorativeBgProps {
  isPlaying: boolean;
  large?: boolean;
}

export default function DecorativeBg({
  isPlaying,
  large = false,
}: DecorativeBgProps) {
  return (
    <div
      className={clsx(
        "flex aspect-square w-auto shrink-0 items-center justify-center rounded-full border-2 border-gray-400/10 bg-background",
        large ? "h-[min(220%,140vw)]" : "h-[min(165%,100vw)]",
      )}
    >
      <div
        className={clsx(
          "flex h-3/4 w-3/4 items-center justify-center rounded-full border-t-2 border-gray-400/10 animate-spin [animation-duration:8s]",
          isPlaying
            ? "[animation-play-state:running]"
            : "[animation-play-state:paused]",
        )}
      >
        <div className="flex aspect-square h-[40%] w-auto max-w-full items-center justify-center rounded-full bg-gray-400/10">
          <div className="flex h-11/12 w-11/12 items-center justify-center rounded-full border-2 border-background" />
        </div>
      </div>
    </div>
  );
}
