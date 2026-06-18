import { Pencil } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ArtistProfileFormSchemaWithoutId } from "../schemas";
import PreHeader from "./pre-header";

export default function PublicInfo({
  artistName,
  artistLogo,
  genre,
  members,
  artistDescription,
  city,
  state,
  country,
}: ArtistProfileFormSchemaWithoutId) {
  return (
    <div className="flex flex-col gap-10 w-full border border-gray-400/80 rounded-md p-8">
      <div className="flex items-center justify-between w-full">
        <h2 className="font-bold uppercase text-indigo-500">Public Info</h2>
        <Link
          href="/profile/artist/edit/public"
          className="flex items-center gap-1"
        >
          <Pencil size={14} /> Edit
        </Link>
      </div>
      <header className="flex justify-between gap-2 border-b border-gray-400/80 pb-4">
        <div className="flex flex-col">
          <PreHeader>Artist Name</PreHeader>
          <h1 className="text-3xl font-bold uppercase">{artistName}</h1>
        </div>
        <div>
          {artistLogo ? (
            <Image
              src={artistLogo}
              alt={artistName ?? "Artist Logo"}
              fill
              className="w-20 h-20 object-cover rounded-full"
            />
          ) : (
            <div className="w-20 h-20 border border-gray-400/80 rounded-full" />
          )}
        </div>
      </header>
      <div className="flex flex-col border-b border-gray-400/80 pb-4">
        <PreHeader>Genre</PreHeader>
        <p className="text-lg">{genre}</p>
      </div>
      <div className="flex flex-col border-b border-gray-400/80 pb-4">
        <PreHeader>Members</PreHeader>
        <p className="text-lg">{members.join(", ")}</p>
      </div>
      <div className="border-b border-gray-400/80 pb-4">
        <PreHeader>Bio</PreHeader>
        <p className="text-lg">{artistDescription}</p>
      </div>
      <div className="flex flex-col gap-2 border-b border-gray-400/80 pb-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <PreHeader>City</PreHeader>
            <p className="text-lg">{city}</p>
          </div>
          <div>
            <PreHeader>State</PreHeader>
            <p className="text-lg">{state}</p>
          </div>
          <div>
            <PreHeader>Country</PreHeader>
            <p className="text-lg">{country}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
