import clsx from "clsx";

interface DecorativeBgProps {
  isPlaying: boolean;
}
export default function DecorativeBg({ isPlaying }: DecorativeBgProps) {
  return (
    <div
      className={clsx(
        "absolute -z-10 md:w-300 md:h-300 w-120 h-120 bg-background rounded-full border-2 border-black/10 flex items-center justify-center",
      )}
    >
      <div
        className={clsx(
          "w-3/4 h-3/4 border-t-2 border-black/10 rounded-full flex items-center justify-center",
          isPlaying && "animate-spin [animation-duration:8s]",
        )}
      >
        <div className="w-1/2 h-1/2 bg-black/5 rounded-full flex items-center justify-center">
          <div className="w-11/12 h-11/12 flex items-center justify-center border-2 border-background rounded-full">
            <div className="w-1/2 h-1/2 bg-background border-4 border-black/5 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
