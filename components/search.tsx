"use client";
import { Profile } from "@/lib/db/types";
import { INPUT_MAX } from "@/lib/input-limits";
import { Loader2, MapPinIcon, Music, SearchIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";

type SearchLocationResult = Pick<Profile, "id" | "city" | "lat" | "lon">;

type SearchArtistResult = Pick<Profile, "id" | "profileName">;

const DEBOUNCE_DELAY = 300;

function SearchUI() {
  const searchParams = useSearchParams();
  const genres = searchParams.getAll("g");
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

  const buildQueryString = (
    pathname: string,
    query: string,
    lat: string | null,
    lon: string | null,
  ) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (genres.length > 0) {
      for (const genre of genres) {
        params.append("g", genre);
      }
    }
    if (lat) params.set("lat", lat);
    if (lon) params.set("lon", lon);
    return `${pathname}?${params.toString()}` as const;
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
          maxLength={INPUT_MAX.search}
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
            className="absolute top-full left-0 w-full bg-background border border-b-4 rounded z-20 flex flex-col"
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
                <div className="w-full border-b">
                  <h3 className="font-semibold px-4 py-2">Locations</h3>
                </div>
                {searchLocationResults.map((city) => (
                  <Link
                    href={buildQueryString(
                      "/location",
                      city.city,
                      city.lat.toString(),
                      city.lon.toString(),
                    )}
                    key={city.id}
                    className="p-2 px-4 border-b last:border-b-0 hover:bg-muted flex items-center gap-2 hover:bg-amber-500/30 transition-colors"
                  >
                    <MapPinIcon size={14} />
                    {city.city}
                  </Link>
                ))}
              </div>
            )}
            {searchArtistResults.length > 0 &&
              searchLocationResults.length > 0 && (
                <div className="w-full border-b" />
              )}
            {searchArtistResults.length > 0 && !isLoading && (
              <div className="flex flex-col">
                <div className="w-full border-b">
                  <h3 className="font-semibold px-4 py-2">Artists</h3>
                </div>
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
                <p className="text-sm">No Results Yet.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Search() {
  const pathname = usePathname();
  const search = useSearchParams();
  const q = search.get("q");

  if (pathname.includes("login") || pathname.includes("signup")) {
    return null;
  }

  return <SearchUI key={q ?? ""} />;
}
