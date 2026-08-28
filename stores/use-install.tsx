"use client";
import { track } from "@vercel/analytics";
import { useSyncExternalStore } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let installPrompt: BeforeInstallPromptEvent | null = null;

export const INSTALL_PROMPT_DELAY_MS = 2 * 60 * 1000;


const listeners = new Set<() => void>();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();

    installPrompt = event as BeforeInstallPromptEvent;

    emitChange();
  });

  window.addEventListener("appinstalled", () => {
    installPrompt = null;

    emitChange();
  });
}

function installPromptStore() {
  function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }

  function getInstallState() {
    return installPrompt;
  }

  function getServerSnapshot() {
    return null;
  }

  function dismiss() {
    installPrompt = null;
    emitChange();
    window.localStorage.setItem("installPromptDismissed", "true");
  }

  function isDismissed() {
    return (
      typeof window !== "undefined" &&
      window.localStorage.getItem("installPromptDismissed") === "true"
    );
  }

  async function install() {
    if (!installPrompt) {
      return;
    }

    await installPrompt.prompt();

    const { outcome } = await installPrompt.userChoice;

    if (outcome === "accepted") {
      installPrompt = null;
      emitChange();
    }
  }

  return {
    subscribe,
    getInstallState,
    getServerSnapshot,
    install,
    dismiss,
    isDismissed,
  };
}

export function useInstall(): BeforeInstallPromptEvent | null {
  const { subscribe, getInstallState, getServerSnapshot } =
    installPromptStore();
  return useSyncExternalStore(subscribe, getInstallState, getServerSnapshot);
}

export function handleInstall() {
  const { install } = installPromptStore();
  return install();
}

export function dismissInstallPrompt() {
  const { dismiss } = installPromptStore();
  return dismiss();
}

export function isInstallPromptDismissed() {
  const { isDismissed } = installPromptStore();
  return isDismissed();
}

export function useIsInstallPromptDismissed() {
  const { subscribe } = installPromptStore();
  return useSyncExternalStore(subscribe, isInstallPromptDismissed, () => false);
}

let canShowInstallPrompt = false;
let canShowTimeout: ReturnType<typeof setTimeout> | null = null;
const canShowListeners = new Set<() => void>();

function emitCanShowChange() {
  for (const listener of canShowListeners) {
    listener();
  }
}

function ensureCanShowTimer() {
  if (canShowInstallPrompt || canShowTimeout) return;

  canShowTimeout = setTimeout(() => {
    canShowInstallPrompt = true;
    canShowTimeout = null;
    track("install_prompt_initialized");
    emitCanShowChange();
  }, INSTALL_PROMPT_DELAY_MS);
}

/** @internal test helper */
export function resetCanShowInstallPromptForTests() {
  if (canShowTimeout) {
    clearTimeout(canShowTimeout);
    canShowTimeout = null;
  }
  canShowInstallPrompt = false;
}

export function useCanShowInstallPrompt() {
  return useSyncExternalStore(
    (listener) => {
      canShowListeners.add(listener);
      ensureCanShowTimer();
      return () => {
        canShowListeners.delete(listener);
      };
    },
    () => canShowInstallPrompt,
    () => false,
  );
}
