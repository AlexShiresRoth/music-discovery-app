"use client";
import { useSyncExternalStore } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let cachedInstallEvent: BeforeInstallPromptEvent | undefined = undefined;

function subscribe(callback: () => void) {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    callback();
    cachedInstallEvent = e as unknown as BeforeInstallPromptEvent;
  });
  return () => {
    window.removeEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      callback();
      cachedInstallEvent = e as unknown as BeforeInstallPromptEvent;
    });
  };
}

function getInstallState() {
  return cachedInstallEvent;
}

export function useInstall(): BeforeInstallPromptEvent | undefined {
  return useSyncExternalStore(subscribe, getInstallState, () => null);
}
