"use client";

import BackButton from "@/components/breadcrumbs";
import Link from "next/link";

export default function ChooseProfile() {
  return (
    <>
      <main className="flex flex-col items-center w-full gap-32 min-h-screen">
        <div className="self-end">
          <BackButton />
        </div>
        <header className="md:w-1/3 mt-12 w-full flex flex-col items-center justify-center gap-8">
          <h1 className="text-2xl md:text-4xl text-center">
            Looks like you don&apos;t have a profile yet, let&apos;s get you set
            up.
          </h1>
          <Link
            href="/profile/create"
            className="px-4 py-2 rounded border-2 bg-amber-500 shadow-[2px_2px_0_0_black] hover:shadow-none uppercase text-black font-bold hover:cursor-pointer transition-all"
          >
            Create Profile
          </Link>
        </header>
      </main>
    </>
  );
}
