import { asStringArray } from "@/lib/search-params";
import { describe, expect, it } from "vitest";

describe("asStringArray", () => {
  it("returns an empty array for missing values", () => {
    expect(asStringArray()).toEqual([]);
    expect(asStringArray(undefined)).toEqual([]);
    expect(asStringArray(null)).toEqual([]);
    expect(asStringArray("")).toEqual([]);
  });

  it("wraps a single string value", () => {
    expect(asStringArray("open-to-gigs")).toEqual(["open-to-gigs"]);
  });

  it("passes through string arrays", () => {
    expect(asStringArray(["open-to-collaboration", "booking-shows"])).toEqual([
      "open-to-collaboration",
      "booking-shows",
    ]);
  });
});
