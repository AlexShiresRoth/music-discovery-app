import {
  getHasVisitedCookieClient,
  HAS_VISITED_COOKIE,
  hasVisitedFromCookie,
  setHasVisited,
} from "@/lib/has-visited";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function clearCookies() {
  for (const row of document.cookie.split(";")) {
    const name = row.split("=")[0]?.trim();
    if (!name) continue;
    document.cookie = `${name}=; max-age=0; path=/`;
  }
}

describe("hasVisitedFromCookie", () => {
  it("returns true only for the string true", () => {
    expect(hasVisitedFromCookie("true")).toBe(true);
    expect(hasVisitedFromCookie("false")).toBe(false);
    expect(hasVisitedFromCookie("")).toBe(false);
    expect(hasVisitedFromCookie(undefined)).toBe(false);
    expect(hasVisitedFromCookie(null)).toBe(false);
  });
});

describe("setHasVisited / getHasVisitedCookieClient", () => {
  beforeEach(() => {
    clearCookies();
  });

  afterEach(() => {
    clearCookies();
    vi.restoreAllMocks();
  });

  it("writes the has-visited cookie and reports visited", () => {
    expect(getHasVisitedCookieClient()).toBe(false);

    setHasVisited();

    expect(document.cookie).toContain(`${HAS_VISITED_COOKIE}=true`);
    expect(getHasVisitedCookieClient()).toBe(true);
  });

  it("dispatches a custom event when the cookie is set", () => {
    const listener = vi.fn();
    window.addEventListener(HAS_VISITED_COOKIE, listener);

    setHasVisited();

    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener(HAS_VISITED_COOKIE, listener);
  });
});
