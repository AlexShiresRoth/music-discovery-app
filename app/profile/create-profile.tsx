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
    <main className="flex flex-col items-center justify-center h-screen">
      <h1>Create Profile</h1>
      <p>
        Want to create an artist profile? You can only create one profile per
        account.
      </p>
      <button onClick={() => setProfileType("artist")}>Artist</button>
      <button onClick={() => setProfileType("listener")}>Listener</button>
      {profileType === "artist" ? (
        <ArtistProfileForm />
      ) : (
        <ListenerProfileForm />
      )}
    </main>
  );
}
