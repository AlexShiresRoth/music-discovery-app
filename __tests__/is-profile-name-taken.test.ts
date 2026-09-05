import { isProfileNameTaken } from "@/lib/profile/display-name";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockSelect, mockFrom, mockWhere, mockLimit } = vi.hoisted(() => ({
  mockSelect: vi.fn(),
  mockFrom: vi.fn(),
  mockWhere: vi.fn(),
  mockLimit: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: { select: mockSelect },
}));

vi.mock("@/lib/db/schema", () => ({
  profilesSchema: {
    id: "id",
    profileName: "profileName",
    userRefId: "userRefId",
  },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn(() => "eq-condition"),
  ilike: vi.fn((col, val) => `ilike(${col}, ${val})`),
  and: vi.fn((...args: unknown[]) => args),
  ne: vi.fn((col, val) => `ne(${col}, ${val})`),
}));

describe("isProfileNameTaken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLimit.mockResolvedValue([]);
    mockWhere.mockReturnValue({ limit: mockLimit });
    mockFrom.mockReturnValue({ where: mockWhere });
    mockSelect.mockReturnValue({ from: mockFrom });
  });

  it("returns false immediately when profile name is empty or whitespace", async () => {
    expect(await isProfileNameTaken("")).toBe(false);
    expect(await isProfileNameTaken("   ")).toBe(false);
    expect(mockSelect).not.toHaveBeenCalled();
  });

  it("returns false when no existing profile matches", async () => {
    mockLimit.mockResolvedValue([]);

    const result = await isProfileNameTaken("Unique Name");

    expect(result).toBe(false);
    expect(mockSelect).toHaveBeenCalledWith({ id: "id" });
    expect(mockFrom).toHaveBeenCalledWith(
      expect.objectContaining({ profileName: "profileName" }),
    );
    expect(mockLimit).toHaveBeenCalledWith(1);
  });

  it("returns true when another profile matches", async () => {
    mockLimit.mockResolvedValue([{ id: 10 }]);

    const result = await isProfileNameTaken("Taken Name");

    expect(result).toBe(true);
  });

  it("trims the profile name before querying", async () => {
    mockLimit.mockResolvedValue([]);

    await isProfileNameTaken("   Neon Harbor   ");

    const { ilike } = await import("drizzle-orm");
    expect(ilike).toHaveBeenCalledWith("profileName", "Neon Harbor");
  });

  it("excludes the current user's profile when excludeUserId is provided", async () => {
    mockLimit.mockResolvedValue([]);

    await isProfileNameTaken("My Own Name", "user-123");

    const { ne } = await import("drizzle-orm");
    expect(ne).toHaveBeenCalledWith("userRefId", "user-123");
  });
});
