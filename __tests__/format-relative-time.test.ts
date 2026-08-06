import {
  formatPublishedAt,
  formatRelativeTime,
} from "@/lib/format-relative-time";
import { describe, expect, it } from "vitest";

const now = Date.parse("2026-08-05T12:00:00.000Z");

describe("formatRelativeTime", () => {
  it("returns null for missing or invalid dates", () => {
    expect(formatRelativeTime(null, now)).toBeNull();
    expect(formatRelativeTime("not-a-date", now)).toBeNull();
  });

  it("formats short and long intervals", () => {
    expect(formatRelativeTime(new Date(now - 30_000), now)).toBe("just now");
    expect(formatRelativeTime(new Date(now - 5 * 60_000), now)).toBe(
      "5 minutes ago",
    );
    expect(formatRelativeTime(new Date(now - 2 * 60 * 60_000), now)).toBe(
      "2 hours ago",
    );
    expect(formatRelativeTime(new Date(now - 3 * 24 * 60 * 60_000), now)).toBe(
      "3 days ago",
    );
    expect(formatRelativeTime(new Date(now - 45 * 24 * 60 * 60_000), now)).toBe(
      "1 month ago",
    );
  });
});

describe("formatPublishedAt", () => {
  it("returns a label and marks items under 5 hours as New", () => {
    expect(
      formatPublishedAt(new Date(now - 2 * 60 * 60_000), now),
    ).toEqual({
      label: "Published 2 hours ago",
      isNew: true,
    });
  });

  it("does not mark items 5 hours or older as New", () => {
    expect(
      formatPublishedAt(new Date(now - 5 * 60 * 60_000), now),
    ).toEqual({
      label: "Published 5 hours ago",
      isNew: false,
    });
    expect(
      formatPublishedAt(new Date(now - 3 * 24 * 60 * 60_000), now),
    ).toEqual({
      label: "Published 3 days ago",
      isNew: false,
    });
  });
});
