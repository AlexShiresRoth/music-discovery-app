"use client";

import BackButton from "@/components/breadcrumbs";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

export default function ChooseProfile() {
  return (
    <>
      <main className="flex flex-col items-center w-full gap-32 min-h-screen">
        <div className="self-end">
          <BackButton />
        </div>
        <header className="md:w-1/2 mt-12 w-full flex flex-col justify-center gap-8">
          <h1 className="text-3xl md:text-7xl font-bold -ml-2">
            Welcome to Side0!
          </h1>
          <p className="md:w-3/4">
            In order to share your music, you need to create a profile. If you
            are just here to browse, you can continue to the{" "}
            <Link href="/" className="underline">
              main feed
            </Link>
            .
          </p>
          <div className="flex flex-col gap-4 items-start">
            <Link
              href="/profile/create"
              className="px-4 py-2 rounded border-2 bg-amber-500 shadow-[2px_2px_0_0_black] hover:shadow-none uppercase text-black font-bold hover:cursor-pointer transition-all"
            >
              Create Profile
            </Link>
            <Link href="/" className="flex items-center text-sm text-gray-500">
              Start Listening
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </header>
      </main>
    </>
  );
}
