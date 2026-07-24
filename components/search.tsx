"use client";
import { Profile } from "@/lib/db/types";
import { MapPinIcon, Music, SearchIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type SearchLocationResult = Pick<
  Profile,
  "id" | "city" | "fullName" | "state" | "country"
>;

// TODO - only show artists names that match the query not if they're based in the location
export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocationResults, setSearchLocationResults] = useState<string[]>(
    [],
  );

  const [searchArtistResults, setSearchArtistResults] = useState<
    SearchLocationResult[]
  >([]);

  const searchResTotal =
    searchLocationResults.length + searchArtistResults.length;

  const handleSearch = async (query: string) => {
    if (query.length > 2) {
      const res = await fetch(`/api/profile/search?query=${query}`);

      if (!res.ok) {
        return;
      }

      const data: SearchLocationResult[] = await res.json();

      const uniqueLocations = [...new Set(data.map((item) => item.city))];

      setSearchLocationResults(uniqueLocations);
      setSearchArtistResults(data);
    }
    if (searchLocationResults.length > 0 && query.length < 3) {
      setSearchLocationResults([]);
      setSearchArtistResults([]);
    }
  };

  console.log(searchLocationResults, searchArtistResults);
  return (
    <div className="w-full max-w-sm">
      <div className="flex items-center gap-2 border-b relative">
        <button>
          <SearchIcon className="w-4 h-4" />
        </button>
        <input
          type="text"
          placeholder="Search artists"
          className="focus:outline-0 pl-4 py-2 w-full"
          onChange={(e) => {
            handleSearch(e.target.value);
            setSearchQuery(e.target.value);
          }}
          value={searchQuery}
        />
        {searchResTotal > 0 && (
          <div className="absolute top-full left-0 w-full bg-background border rounded z-20 flex flex-col gap-4 py-4">
            {searchLocationResults.length > 0 && (
              <div className="flex flex-col">
                <h3 className="font-semibold px-2 pb-2">Locations</h3>
                {searchLocationResults.map((city) => (
                  <Link
                    href={`/profile?q=${city}`}
                    key={city}
                    className="p-2 px-4 border-b last:border-b-0 hover:bg-muted flex items-center gap-2 hover:bg-amber-500/30 transition-colors"
                  >
                    <MapPinIcon size={14} />
                    {city}
                  </Link>
                ))}
              </div>
            )}
            {searchArtistResults.length > 0 && (
              <div className="flex flex-col">
                <h3 className="font-semibold px-2 pb-2">Artists</h3>
                {searchArtistResults.map((artist) => (
                  <Link
                    href={`/profile?q=${artist.fullName}`}
                    key={artist.id}
                    className="p-2 px-4 border-b last:border-b-0 hover:bg-muted flex items-center gap-2 hover:bg-amber-500/30 transition-colors"
                  >
                    <Music size={14} />
                    {artist.fullName}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
        {searchQuery.length > 2 && searchResTotal == 0 && (
          <div className="absolute top-full left-0 w-full bg-background border rounded z-20">
            <div className="p-2 flex flex-col items-center justify-center h-20 w-full">
              <p>No results found</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
