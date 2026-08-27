"use client";
import { track } from "@vercel/analytics";
import { useEffect, useState, useSyncExternalStore } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let installPrompt: BeforeInstallPromptEvent | null = null;

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

export function useCanShowInstallPrompt() {
  const [canShowInstallPrompt, setCanShowInstallPrompt] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(
      () => {
        setCanShowInstallPrompt(true);
        track("install_prompt_initialized");
      },
      3 * 60 * 1000,
    );
    return () => clearTimeout(timeout);
  }, []);
  return canShowInstallPrompt;
}
