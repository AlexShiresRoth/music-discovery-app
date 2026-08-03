"use client";
import { GENRES } from "@/constants";
import clsx from "clsx";
import { SlidersVertical, XIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

function Filters({
  lat,
  lon,
  q,
  pathname,
  genres,
}: {
  lat: string | null;
  lon: string | null;
  q: string | null;
  pathname: string;
  genres: string[];
}) {
  const selectedFilters = useMemo<string[]>(() => [...genres], [genres]);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const buildQueryString = (genres: string[]) => {
    const params = new URLSearchParams();
    if (lat) params.set("lat", lat);
    if (lon) params.set("lon", lon);
    if (q) params.set("q", q);
    if (genres.length > 0) {
      for (const genre of genres) {
        params.append("g", genre);
      }
    } else {
      params.delete("g");
    }
    return `${pathname}?${params.toString()}` as const;
  };

  return (
    <div
      className="relative flex items-center gap-2 z-20"
      onBlur={() => setShowFilters(false)}
    >
      <button
        className="flex items-center gap-2 hover:cursor-pointer"
        onClick={() => setShowFilters(!showFilters)}
      >
        {showFilters ? (
          <XIcon className="w-4 h-4" />
        ) : (
          <SlidersVertical className="w-4 h-4" />
        )}
        <span className="hidden md:block">Filters</span>
        {selectedFilters.length > 0 && (
          <span className="text-xs w-4 h-4 flex items-center justify-center rounded-full border bg-amber-500">
            {selectedFilters.length}
          </span>
        )}
      </button>
      {showFilters && (
        <div
          className="flex items-center gap-2 absolute z-20 min-w-78 top-full left-0 bg-background border border-b-4 pt-4 rounded-md"
          onMouseDown={(e) => e.preventDefault()}
        >
          <div className="flex flex-col w-full">
            <div className="flex justify-between items-center px-2 border-b pb-2">
              <label className="font-semibold">Genre</label>
              <XIcon
                className="w-4 h-4 hover:cursor-pointer"
                onClick={() => setShowFilters(false)}
              />
            </div>
            <div className="grid grid-cols-3">
              {GENRES.map((g) => (
                <Link
                  href={buildQueryString(
                    selectedFilters.includes(g.value)
                      ? selectedFilters.filter((f) => f !== g.value)
                      : [...selectedFilters, g.value],
                  )}
                  key={g.value}
                  className={clsx(
                    "hover:cursor-pointer hover:bg-amber-500/50 transition-colors border-b p-3 text-start",
                    selectedFilters.includes(g.value) && "bg-amber-500/50",
                  )}
                >
                  {g.label}
                </Link>
              ))}
            </div>
            {selectedFilters.length > 0 && (
              <div className="flex justify-center items-center w-full">
                <Link
                  href={buildQueryString([])}
                  className="bg-amber-500 text-sm w-full text-center p-2 font-semibold"
                >
                  Clear
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function FeedFilter() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const genres = searchParams.getAll("g");
  const q = searchParams.get("q");
  const notAllowedPaths = ["/login", "/signup", "/profile", "/profiles"];

  if (notAllowedPaths.some((path) => pathname.startsWith(path))) {
    return null;
  }

  return (
    <Filters
      lat={lat}
      lon={lon}
      genres={genres}
      q={q}
      pathname={pathname}
      key={`${lat}-${lon}-${q}`}
    />
  );
}
