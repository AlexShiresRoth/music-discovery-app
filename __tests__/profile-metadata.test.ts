import { generateMetadata } from "@/app/profiles/[id]/page";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetProfileById } = vi.hoisted(() => ({
  mockGetProfileById: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  getProfileById: mockGetProfileById,
}));

describe("profiles/[id] generateMetadata", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns not-found title when the profile is missing", async () => {
    mockGetProfileById.mockResolvedValue(null);

    const metadata = await generateMetadata({
      params: Promise.resolve({ id: "99" }),
    });

    expect(metadata).toEqual({ title: "Profile not found" });
  });

  it("builds Open Graph and Twitter metadata from the profile", async () => {
    mockGetProfileById.mockResolvedValue({
      id: 12,
      profileName: "Nora Vale",
      bio: "Indie folk from Brooklyn.",
      city: "Brooklyn",
      stateCode: "NY",
      imageUrl: "https://cdn.example.com/nora.jpg",
      songClips: [],
      influences: [],
    });

    const metadata = await generateMetadata({
      params: Promise.resolve({ id: "12" }),
    });

    expect(metadata.title).toBe("Nora Vale");
    expect(metadata.description).toBe("Indie folk from Brooklyn.");
    expect(metadata.alternates).toEqual({ canonical: "/profiles/12" });
    expect(metadata.openGraph).toMatchObject({
      title: "Nora Vale",
      description: "Indie folk from Brooklyn.",
      url: "/profiles/12",
      type: "profile",
      images: [
        {
          url: "https://cdn.example.com/nora.jpg",
          alt: "Nora Vale",
        },
      ],
    });
    expect(metadata.twitter).toMatchObject({
      card: "summary_large_image",
      title: "Nora Vale",
      images: ["https://cdn.example.com/nora.jpg"],
    });
  });

  it("falls back to location when bio is empty and omits images", async () => {
    mockGetProfileById.mockResolvedValue({
      id: 3,
      profileName: "Local Band",
      bio: null,
      city: "Austin",
      stateCode: "TX",
      imageUrl: null,
      songClips: [],
      influences: [],
    });

    const metadata = await generateMetadata({
      params: Promise.resolve({ id: "3" }),
    });

    expect(metadata.description).toBe("Local Band · Austin, TX");
    expect(metadata.openGraph?.images).toBeUndefined();
    expect(metadata.twitter).toMatchObject({ card: "summary" });
  });
});
