"use client";

import { useHasVisited } from "@/stores/use-has-visited";
import { track } from "@vercel/analytics";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NearbyButton() {
  const hasVisited = useHasVisited();
  const [pending, setPending] = useState(false);
  const router = useRouter();
  const getLocation = () => {
    setPending(true);
    return navigator.geolocation.getCurrentPosition((event) => {
      if (event.coords) {
        track("allow_location_access");
        router.push(
          `/location?lat=${event.coords.latitude}&lon=${event.coords.longitude}`,
        );
        setPending(false);
      } else {
        console.info("Location access denied");
        track("deny_location_access");
        setPending(false);
      }
    });
  };

  return (
    hasVisited && (
      <button
        type="button"
        className="md:py-1 text-sm md:text-xs px-2 py-2 md:px-4 flex items-center justify-end md:rounded border-b md:bg-amber-500 font-bold md:border-2 md:border-b-4 hover:cursor-pointer hover:bg-amber-400 disabled:opacity-50"
        onClick={getLocation}
        disabled={pending}
      >
        {pending ? "Searching..." : "Nearby"}
      </button>
    )
  );
}
