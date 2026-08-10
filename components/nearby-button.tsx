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
    navigator.geolocation.getCurrentPosition((event) => {
      try {
        setPending(true);
        if (event.coords) {
          track("allow_location_access");
          router.push(
            `/location?lat=${event.coords.latitude}&lon=${event.coords.longitude}`,
          );
        } else {
          track("deny_location_access");
        }
      } finally {
        setPending(false);
      }
    });
  };
  return (
    hasVisited && (
      <button
        type="button"
        className="py-1 text-xs px-4 rounded bg-amber-500 font-bold border-2 border-b-4 hover:cursor-pointer hover:bg-amber-400 disabled:opacity-50"
        onClick={getLocation}
        disabled={pending}
      >
        {pending ? "Loading..." : "Nearby"}
      </button>
    )
  );
}
