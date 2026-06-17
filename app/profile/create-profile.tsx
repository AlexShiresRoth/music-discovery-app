"use client";

import clsx from "clsx";
import Link from "next/link";

export default function CreateProfile() {
  return (
    <main className="flex flex-col items-center justify-center w-full gap-12 py-12">
      <div className="md:w-3/4 w-full flex flex-col items-center justify-center">
        <header className="w-2/3 flex flex-col items-center justify-center gap-12 py-20">
          <h1 className="text-7xl font-bold text-center">
            Welcome to the music discovery app...
          </h1>
          <p className="text-lg max-w-md text-center">
            Let{`'`}s get you set up with a profile. Are you looking to discover
            new music or be discovered by new listeners?
          </p>
          <div className="flex items-center gap-8">
            <Link
              href="/profile/artist"
              className={clsx(
                "bg-indigo-500 text-black uppercase px-4 py-2",
                "rounded font-bold hover:bg-indigo-600 transition-all",
                "hover:cursor-pointer",
              )}
            >
              Artist
            </Link>
            <span>or</span>
            <Link
              href="/profile/listener"
              className={clsx(
                "bg-amber-500 text-black uppercase px-4 py-2",
                "rounded font-bold hover:bg-amber-600 transition-all",
                "hover:cursor-pointer",
              )}
            >
              Listener
            </Link>
          </div>
        </header>
      </div>
    </main>
  );
}
