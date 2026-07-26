"use client";
import { GENRES } from "@/constants";
import { SlidersVertical, XIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";

function Filters({
  lat,
  lon,
  q,
  pathname,
}: {
  lat: string | null;
  lon: string | null;
  q: string | null;
  pathname: string;
}) {
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const buildQueryString = (genre: string) => {
    const params = new URLSearchParams();
    if (lat) params.set("lat", lat);
    if (lon) params.set("lon", lon);
    if (q) params.set("q", q);
    if (genre) params.set("g", genre);
    return `${pathname}?${params.toString()}` as const;
  };

  return (
    <div
      className="relative flex items-center gap-2"
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
      </button>
      {showFilters && (
        <div
          className="flex items-center gap-2 absolute z-20 min-w-72 top-full left-0 bg-background border pt-4 rounded-md"
          onMouseDown={(e) => e.preventDefault()}
        >
          <div className="flex flex-col w-full">
            <label className="font-semibold border-b pb-2 px-2">Genre</label>
            <div className="grid grid-cols-3">
              {GENRES.map((g) => (
                <Link
                  href={buildQueryString(g.value)}
                  key={g.value}
                  className="hover:cursor-pointer hover:bg-amber-500/50 transition-colors border-b py-2 last:border-b-0 px-2"
                >
                  {g.label}
                </Link>
              ))}
            </div>
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
  const genre = searchParams.get("g");
  const q = searchParams.get("q");
  return (
    <Filters
      lat={lat}
      lon={lon}
      q={q}
      pathname={pathname}
      key={`${lat}-${lon}-${genre}-${q}`}
    />
  );
}
