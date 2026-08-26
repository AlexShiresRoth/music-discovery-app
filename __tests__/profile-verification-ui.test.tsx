import Profile from "@/app/profile/profile";
import type { Profile as ProfileType, SongClip } from "@/lib/db/types";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({
  default: (props: { alt: string }) => <img alt={props.alt} />,
}));

vi.mock("@/app/profile/private-info", () => ({
  default: () => <div>Private info</div>,
}));

vi.mock("@/app/profile/public-info", () => ({
  default: () => <div>Public info</div>,
}));

vi.mock("@/app/profile/social", () => ({
  default: () => <div>Social</div>,
}));

vi.mock("@/app/profile/song-clips", () => ({
  default: () => <div>Song clips</div>,
}));

vi.mock("@/app/profile/share-profile-button", () => ({
  default: () => <button type="button">Share Profile</button>,
}));

vi.mock("@/app/profile/upload-image", () => ({
  default: () => <div>Upload image</div>,
}));

vi.mock("@/components/profile-links-display", () => ({
  default: () => <div>Links</div>,
}));

vi.mock("@/components/profile-location-display", () => ({
  default: () => <div>Location</div>,
}));

vi.mock("@/components/empty-state", () => ({
  default: ({ message }: { message: string }) => <p>{message}</p>,
}));

const baseProfile = {
  id: 1,
  profileName: "Test Artist",
  bio: "Hello",
  public: true,
  isVerified: false,
  imageUrl: null,
  city: "Brooklyn",
  stateCode: "NY",
} as unknown as ProfileType;

async function renderProfile(
  overrides: {
    profile?: Partial<ProfileType>;
    verificationRequest?: "open" | "closed" | "resolved" | "in_progress" | null;
  } = {},
) {
  const ui = await Profile({
    profile: { ...baseProfile, ...overrides.profile } as ProfileType,
    clips: [] as SongClip[],
    verificationRequest: overrides.verificationRequest ?? null,
  });
  return render(ui);
}

describe("Profile verification UI", () => {
  it("shows Get Verified when unverified with no request", async () => {
    await renderProfile({ verificationRequest: null });

    expect(
      screen.getByRole("link", { name: "Get Verified" }),
    ).toHaveProperty("href", "http://localhost:3000/profile/verify");
    expect(screen.queryByText(/pending review/i)).toBeNull();
    expect(screen.queryByText("Song clips")).toBeNull();
  });

  it("shows a pending message when a request is open", async () => {
    await renderProfile({ verificationRequest: "open" });

    expect(screen.getByText(/pending review/i)).toBeDefined();
    expect(screen.queryByRole("link", { name: "Get Verified" })).toBeNull();
    expect(screen.queryByText("Song clips")).toBeNull();
  });

  it("shows a retry path when verification was closed", async () => {
    await renderProfile({ verificationRequest: "closed" });

    expect(screen.getByText(/could not be verified/i)).toBeDefined();
    expect(screen.getByRole("link", { name: "here" })).toHaveProperty(
      "href",
      "http://localhost:3000/profile/verify",
    );
    expect(screen.queryByRole("link", { name: "Get Verified" })).toBeNull();
  });

  it("shows song clips when the profile is verified", async () => {
    await renderProfile({
      profile: { isVerified: true } as Partial<ProfileType>,
      verificationRequest: "resolved",
    });

    expect(screen.getByText("Song clips")).toBeDefined();
    expect(screen.queryByRole("link", { name: "Get Verified" })).toBeNull();
    expect(screen.queryByText(/pending review/i)).toBeNull();
  });
});
