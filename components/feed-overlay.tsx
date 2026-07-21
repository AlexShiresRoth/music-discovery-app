"use client";
import { useLocalStorage } from "@/stores/use-local-storage";
import clsx from "clsx";

export default function IntroOverlay() {
  const hasVisited = useLocalStorage();

  if (hasVisited) {
    return null;
  }
  return (
    <div
      className={clsx(
        "fixed top-0 left-0 w-full h-full flex flex-col items-center justify-center",
        hasVisited && "animate-fade-out duration-300 -z-10",
        !hasVisited && "animate-fade-in duration-300 bg-black/90 z-10",
      )}
    >
      <div className="flex flex-col justify-center h-full w-11/12">
        <div className="flex flex-col max-w-5xl gap-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white">
            Discover your local underground music scene
          </h1>
          <p className="text-white">Press the play button to start listening</p>
          <p className="text-white">Scroll to discover more artists</p>
        </div>
      </div>
      <div className="w-full pb-4 relative">
        <div className="h-0.5 bg-amber-500 w-full animate-grow-width absolute bottom-11 left-0"></div>
      </div>
    </div>
  );
}
