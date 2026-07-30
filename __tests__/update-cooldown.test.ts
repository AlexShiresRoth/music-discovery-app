import {
  UPDATE_COOLDOWN_MS,
  canBumpUpdatedAt,
  nextUpdatedAt,
} from "@/lib/profile/update-cooldown";
import { describe, expect, it } from "vitest";

const NOW = new Date("2026-07-30T18:00:00.000Z");

describe("canBumpUpdatedAt", () => {
  it("allows a bump when lastUpdatedAt is null", () => {
    expect(canBumpUpdatedAt(null, NOW)).toBe(true);
  });

  it("allows a bump when lastUpdatedAt is undefined", () => {
    expect(canBumpUpdatedAt(undefined, NOW)).toBe(true);
  });

  it("does not allow a bump when last update was 59 minutes ago", () => {
    const lastUpdatedAt = new Date(NOW.getTime() - 59 * 60 * 1000);
    expect(canBumpUpdatedAt(lastUpdatedAt, NOW)).toBe(false);
  });

  it("does not allow a bump when last update was exactly one cooldown ago", () => {
    const lastUpdatedAt = new Date(NOW.getTime() - UPDATE_COOLDOWN_MS);
    expect(canBumpUpdatedAt(lastUpdatedAt, NOW)).toBe(false);
  });

  it("allows a bump when last update was one cooldown plus 1ms ago", () => {
    const lastUpdatedAt = new Date(NOW.getTime() - UPDATE_COOLDOWN_MS - 1);
    expect(canBumpUpdatedAt(lastUpdatedAt, NOW)).toBe(true);
  });
});

describe("nextUpdatedAt", () => {
  it("returns now when there is no previous update", () => {
    expect(nextUpdatedAt(null, NOW)).toBe(NOW);
    expect(nextUpdatedAt(undefined, NOW)).toBe(NOW);
  });

  it("preserves the previous updatedAt while within the cooldown", () => {
    const lastUpdatedAt = new Date(NOW.getTime() - 10 * 60 * 1000);
    expect(nextUpdatedAt(lastUpdatedAt, NOW)).toBe(lastUpdatedAt);
  });

  it("returns now when the cooldown has passed", () => {
    const lastUpdatedAt = new Date(NOW.getTime() - UPDATE_COOLDOWN_MS - 1);
    expect(nextUpdatedAt(lastUpdatedAt, NOW)).toBe(NOW);
  });
});
