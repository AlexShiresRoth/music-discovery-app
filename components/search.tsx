"use client";
import { Profile } from "@/lib/db/types";
import { Loader2, MapPinIcon, Music, SearchIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";

type SearchLocationResult = Pick<Profile, "id" | "city" | "lat" | "lon">;

type SearchArtistResult = Pick<Profile, "id" | "profileName">;

const DEBOUNCE_DELAY = 300;

function SearchUI() {
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocationResults, setSearchLocationResults] = useState<
    SearchLocationResult[]
  >([]);

  const [searchArtistResults, setSearchArtistResults] = useState<
    SearchArtistResult[]
  >([]);
  const [shouldOpen, setShouldOpen] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const searchResTotal =
    searchLocationResults.length + searchArtistResults.length;

  const handleSearch = async (query: string) => {
    if (query.length > 2) {
      const res = await fetch(`/api/profile/search?query=${query}`);

      if (!res.ok) {
        return;
      }

      const {
        cities,
        artists,
      }: { cities: SearchLocationResult[]; artists: SearchArtistResult[] } =
        await res.json();

      const uniqueLocationsMap = new Map<string, SearchLocationResult>();
      for (const city of cities) {
        uniqueLocationsMap.set(city.city, city);
      }
      const uniqueLocations = Array.from(uniqueLocationsMap.values());

      setSearchLocationResults(uniqueLocations);
      setSearchArtistResults(artists);
      setIsLoading(false);
      setShouldOpen(true);
    }
    if (
      (searchLocationResults.length > 0 || searchArtistResults.length > 0) &&
      query.length < 3
    ) {
      setSearchLocationResults([]);
      setSearchArtistResults([]);
      setShouldOpen(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchLocationResults([]);
    setSearchArtistResults([]);
    setShouldOpen(false);
  };

  return (
    <div className="w-3/4 md:w-full max-w-sm">
      <div className="flex items-center gap-2 border-b relative" tabIndex={-1}>
        <button>
          <SearchIcon className="w-4 h-4" />
        </button>
        <input
          type="text"
          placeholder="Search artists or locations"
          className="focus:outline-0 pl-4 py-2 w-full"
          data-search-input
          onBlur={clearSearch}
          onChange={(e) => {
            const query = e.target.value;

            setSearchQuery(query);
            setIsLoading(query.length > 2);

            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => {
              void handleSearch(query);
            }, DEBOUNCE_DELAY);
          }}
          value={searchQuery}
        />
        {searchQuery.length > 0 && (
          <button onClick={clearSearch}>
            <XIcon className="w-4 h-4" />
          </button>
        )}

        {shouldOpen && searchResTotal > 0 && (
          <div
            className="absolute top-full left-0 w-full bg-background border rounded z-20 flex flex-col gap-4 pt-4"
            id="search-results"
            data-search-results
            onMouseDown={(e) => e.preventDefault()}
          >
            {isLoading && (
              <div className="p-2 flex flex-col items-center justify-center h-20 w-full">
                <Loader2 className="w-4 h-4 animate-spin" />
                <p>Loading...</p>
              </div>
            )}
            {searchLocationResults.length > 0 && !isLoading && (
              <div className="flex flex-col">
                <h3 className="font-semibold px-2 pb-2">Locations</h3>
                {searchLocationResults.map((city) => (
                  <Link
                    href={`/location?q=${city.city}&lat=${city.lat}&lon=${city.lon}`}
                    key={city.id}
                    className="p-2 px-4 border-b last:border-b-0 hover:bg-muted flex items-center gap-2 hover:bg-amber-500/30 transition-colors"
                  >
                    <MapPinIcon size={14} />
                    {city.city}
                  </Link>
                ))}
              </div>
            )}
            {searchArtistResults.length > 0 && !isLoading && (
              <div className="flex flex-col">
                <h3 className="font-semibold px-2 pb-2">Artists</h3>
                {searchArtistResults.map((artist) => (
                  <Link
                    href={`/artist?q=${artist.profileName}`}
                    key={artist.id}
                    className="p-2 px-4 border-b last:border-b-0 hover:bg-muted flex items-center gap-2 hover:bg-amber-500/30 transition-colors"
                  >
                    <Music size={14} />
                    {artist.profileName}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
        {searchQuery.length > 2 && searchResTotal == 0 && (
          <div className="absolute top-full left-0 w-full bg-background border rounded z-20">
            <div className="p-2 flex flex-col items-center justify-center h-20 w-full">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <p>Loading...</p>
                </>
              ) : (
                <p>No results found</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
// TODO - fix navigation on mobile with search
// TODO - fix feed profile layout on mobile
export default function Search() {
  const search = useSearchParams();
  const q = search.get("q");
  return <SearchUI key={q ?? ""} />;
}
