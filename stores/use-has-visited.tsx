"use client";

import {
  getHasVisitedCookieClient,
  HAS_VISITED_COOKIE,
} from "@/lib/has-visited";
import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  window.addEventListener(HAS_VISITED_COOKIE, callback);
  return () => window.removeEventListener(HAS_VISITED_COOKIE, callback);
}

/** Client cookie subscription — for UI that updates after setHasVisited(). */
export function useHasVisited() {
  return useSyncExternalStore(
    subscribe,
    getHasVisitedCookieClient,
    () => false,
  );
}
