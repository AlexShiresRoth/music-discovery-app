"use client";

import { setHasVisited } from "@/lib/has-visited";
import Link from "next/link";
import { useRouter } from "next/navigation";

/** In-flow intro header. Layout only mounts this when the visit cookie is unset. */
export default function IntroOverlay() {
  const router = useRouter();

  const getLocation = () => {
    try {
      navigator.geolocation.getCurrentPosition((event) => {
        if (event.coords) {
          setHasVisited();
          router.push(
            `/location?lat=${event.coords.latitude}&lon=${event.coords.longitude}`,
          );
          router.refresh();
        }
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <header className="@container relative flex w-full shrink-0 flex-col items-center justify-center overflow-hidden border-b border-gray-500/10">
      <div className="relative z-0 flex flex-col w-full items-center justify-center gap-8 py-8 md:py-16">
        <div className="relative flex max-w-2xl flex-col items-center gap-4 text-center">
          <h1 className="animate-grow-vertical font-serif text-4xl font-bold md:text-6xl">
            Discover music the algorithms missed.
          </h1>
          <p className="animate-text-fade-in flex flex-wrap justify-center gap-1 text-lg text-gray-700 md:text-xl">
            <span>Independent artists.</span> <span>Local scenes.</span>{" "}
            <span>No algorithms.</span>
          </p>

          <div className="animate-grow-vertical flex gap-2">
            <button
              type="button"
              onClick={getLocation}
              className="rounded border-2 border-b-4 bg-amber-500 p-2 text-sm font-bold transition-all hover:cursor-pointer hover:bg-amber-400"
            >
              Explore Nearby
            </button>
            <Link
              href="/profile/create"
              onClick={() => setHasVisited()}
              className="flex items-center rounded border-2 border-b-4 border-black p-2 text-sm font-bold transition-all hover:cursor-pointer hover:bg-black hover:text-background"
            >
              Share Your Music
            </Link>
          </div>
        </div>
      </div>

      <div className="relative w-full flex items-center justify-center">
        <div className="absolute bottom-0 -z-10 aspect-square w-[max(100cqw,100cqh)] md:w-[max(70cqw,70cqh)] translate-y-2/3 rounded-full border-t-2 border-gray-500/10" />
        <div className="flex aspect-square w-[max(30cqw,30cqh)] translate-y-2/3 items-center justify-center rounded-full bg-gray-400/5 absolute bottom-0 -z-10">
          <div className="flex h-11/12 w-11/12 items-center justify-center rounded-full border-2 border-background" />
        </div>
      </div>
    </header>
  );
}
