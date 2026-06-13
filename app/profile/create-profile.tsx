"use client";

import { useState } from "react";
import ArtistProfileForm from "./artist-form";
import ListenerProfileForm from "./listener-form";

type Props = {
  userId: string;
};

export default function CreateProfile({ userId }: Props) {
  const [profileType, setProfileType] = useState<"artist" | "listener">(
    "artist",
  );
  return (
    <main className="flex flex-col items-center justify-center w-full gap-12 py-12">
      <header className="md:w-3/4 w-full">
        <h1>Create Profile</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setProfileType("artist")}>Artist</button>
          <span>or</span>
          <button onClick={() => setProfileType("listener")}>Listener</button>
        </div>
      </header>
      <div className="md:w-3/4 w-full">
        {profileType === "artist" ? (
          <ArtistProfileForm />
        ) : (
          <ListenerProfileForm />
        )}
      </div>
    </main>
  );
}
