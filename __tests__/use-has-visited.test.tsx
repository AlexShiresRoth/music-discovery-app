import { setHasVisited } from "@/lib/has-visited";
import { useHasVisited } from "@/stores/use-has-visited";
import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

function clearCookies() {
  for (const row of document.cookie.split(";")) {
    const name = row.split("=")[0]?.trim();
    if (!name) continue;
    document.cookie = `${name}=; max-age=0; path=/`;
  }
}

function Probe() {
  const hasVisited = useHasVisited();
  return <span>{hasVisited ? "visited" : "new"}</span>;
}

describe("useHasVisited", () => {
  beforeEach(() => {
    clearCookies();
  });

  afterEach(() => {
    clearCookies();
  });

  it("starts false and flips to true when setHasVisited runs", () => {
    render(<Probe />);
    expect(screen.getByText("new")).toBeDefined();

    act(() => {
      setHasVisited();
    });

    expect(screen.getByText("visited")).toBeDefined();
  });
});
