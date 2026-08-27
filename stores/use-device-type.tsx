"use client";

import { getDeviceSnapshot } from "@/lib/device-snapshot";
import { useSyncExternalStore } from "react";

type DeviceType = {
  isIOS: boolean;
  isMacOS: boolean;
  isStandalone: boolean;
};

let cachedClientSnapshot: DeviceType | null = null;

function getDeviceType(): DeviceType {
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as Window & typeof globalThis).MSStream;
  const isMacOS = /Macintosh/gi.test(navigator.userAgent);
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches;

  if (
    cachedClientSnapshot &&
    cachedClientSnapshot.isIOS === isIOS &&
    cachedClientSnapshot.isStandalone === isStandalone
  ) {
    return cachedClientSnapshot;
  }

  cachedClientSnapshot = { isIOS, isStandalone, isMacOS };
  return cachedClientSnapshot;
}

function subscribe(callback: () => void) {
  const media = window.matchMedia("(display-mode: standalone)");
  media.addEventListener("change", callback);
  window.addEventListener("load", callback);
  return () => {
    media.removeEventListener("change", callback);
    window.removeEventListener("load", callback);
  };
}

export function useDeviceType() {
  return useSyncExternalStore(subscribe, getDeviceType, getDeviceSnapshot);
}
