"use client";
import { useLocalStorage } from "@/stores/use-local-storage";

import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function IntroOverlay() {
  const router = useRouter();
  const hasVisited = useLocalStorage();

  const getLocation = async () => {
    try {
      const geo = navigator.geolocation;
      return geo.getCurrentPosition((event) => {
        if (event.coords) {
          router.push(
            `/location?lat=${event.coords.latitude}&lon=${event.coords.longitude}`,
          );
        }
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div
      className={clsx(
        "w-full flex flex-col items-center justify-center border-b border-gray-500/10 transition-all duration-1000 ease-in-out",
        hasVisited && "animate-fade-out max-h-0 opacity-0",
        !hasVisited &&
          "animate-fade-in bg-background/50 backdrop-blur-md max-h-screen",
      )}
    >
      <div className="flex items-center justify-center pt-8 pb-2 md:py-16 w-full gap-8">
        <div className="flex flex-col max-w-2xl gap-4 relative text-center items-center">
          <h1 className="text-3xl md:text-6xl font-bold font-serif animate-fade-in">
            Discover music the algorithms missed.
          </h1>
          <p className="text-lg md:text-xl text-gray-700 flex flex-wrap gap-1 justify-center animate-fade-in">
            <span>Independent artists.</span> <span>Local scenes.</span>{" "}
            <span>No algorithms.</span>
          </p>
          <p className="text-base md:text-lg text-gray-700 text-center">
            A home for independent musicians and the people who want to discover
            them.
          </p>
          <div className="flex gap-2">
            <button
              onClick={getLocation}
              className="p-2 rounded bg-amber-500 border-2 border-b-4 font-bold text-sm hover:bg-amber-400 hover:cursor-pointer transition-all"
            >
              Start Listening
            </button>
            <Link
              href="/profile/create"
              className="p-2 rounded border-2 text-sm flex items-center font-bold border-b-4 hover:bg-black border-black hover:text-background hover:cursor-pointer transition-all"
            >
              Share Your Music
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
