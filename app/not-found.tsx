import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 py-16 text-center">
      <h1 className="font-serif text-4xl font-bold md:text-5xl">
        Page not found
      </h1>
      <p className="max-w-md text-gray-600">
        That page doesn’t exist — try discovering artists from the home feed.
      </p>
      <Link
        href="/"
        className="rounded border-2 bg-amber-500 px-4 py-2 font-bold uppercase text-black shadow-[2px_2px_0_0_black] transition-all hover:shadow-none"
      >
        Back home
      </Link>
    </div>
  );
}
