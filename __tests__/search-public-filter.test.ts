import { searchCities, searchProfiles } from "@/lib/db/search";
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
    public: "public",
    profileName: "profileName",
    city: "city",
    lat: "lat",
    lon: "lon",
  },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((column, value) => ({ column, value, type: "eq" })),
  and: vi.fn((...conditions) => ({ conditions, type: "and" })),
  or: vi.fn((...conditions) => ({ conditions, type: "or" })),
  ilike: vi.fn((column, value) => ({ column, value, type: "ilike" })),
}));

const isPublicFilter = { column: "public", value: true, type: "eq" };

describe("search public filter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelect.mockReturnValue({ from: mockFrom });
    mockFrom.mockReturnValue({ where: mockWhere });
    mockWhere.mockReturnValue({ limit: mockLimit });
    mockLimit.mockResolvedValue([]);
  });

  it("limits artist search to public profiles", async () => {
    await searchProfiles("Neon", 5);

    expect(mockWhere).toHaveBeenCalledWith({
      conditions: [
        isPublicFilter,
        {
          conditions: [
            { column: "profileName", value: "Neon%", type: "ilike" },
          ],
          type: "or",
        },
      ],
      type: "and",
    });
    expect(mockLimit).toHaveBeenCalledWith(5);
  });

  it("limits city search to public profiles", async () => {
    await searchCities("Aus", 5);

    expect(mockWhere).toHaveBeenCalledWith({
      conditions: [
        isPublicFilter,
        { column: "city", value: "Aus%", type: "ilike" },
      ],
      type: "and",
    });
    expect(mockLimit).toHaveBeenCalledWith(5);
  });
});
