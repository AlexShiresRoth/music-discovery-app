import { useSyncExternalStore } from "react";

const KEY = "has-visited";

function subscribe(callback: (value: StorageEvent) => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(
    KEY as keyof WindowEventMap,
    callback as EventListener,
  );
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(
      KEY as keyof WindowEventMap,
      callback as EventListener,
    );
  };
}

function getServerSnapshot() {
  return true;
}

function getSnapshot() {
  return localStorage.getItem(KEY) === "true";
}

export function useLocalStorage() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function setHasVisited() {
  localStorage.setItem(KEY, "true");
  window.dispatchEvent(new Event(KEY));
}
