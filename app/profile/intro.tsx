"use client";

import Link from "next/link";

export default function ChooseProfile() {
  return (
    <main className="flex flex-col items-center justify-center w-full gap-12 py-12">
      <div className="md:w-3/4 w-full flex flex-col items-center justify-center">
        <header className="w-2/3 flex flex-col items-center justify-center gap-12 py-20">
          <h1 className="text-2xl text-center">
            Looks like you don&apos;t have a profile yet, let&apos;s get you set
            up!
          </h1>
        </header>
        <Link
          href="/profile/create"
          className="bg-amber-500 text-black uppercase px-4 py-2 rounded font-bold hover:bg-amber-600 transition-all hover:cursor-pointer"
        >
          Create Profile
        </Link>
      </div>
    </main>
  );
}
