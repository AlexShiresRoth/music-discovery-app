import StatusDisplay from "@/components/status-display";
import { PROFILE_STATUS_FILTERS } from "@/constants";
import type { ProfileWithSongClips } from "@/lib/db/types";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

function makeProfile(
  overrides: Partial<ProfileWithSongClips> = {},
): ProfileWithSongClips {
  return {
    id: 1,
    profileName: "Test Band",
    openToCollaboration: false,
    openToGigs: false,
    needActForShow: false,
    statusMessage: null,
    ...overrides,
  } as ProfileWithSongClips;
}

describe("StatusDisplay", () => {
  it("renders active status labels", () => {
    render(
      <StatusDisplay
        profile={makeProfile({
          openToCollaboration: true,
          openToGigs: true,
          needActForShow: true,
        })}
      />,
    );

    expect(
      screen.getByText(PROFILE_STATUS_FILTERS.openToCollaboration.label),
    ).toBeDefined();
    expect(
      screen.getByText(PROFILE_STATUS_FILTERS.openToGigs.label),
    ).toBeDefined();
    expect(
      screen.getByText(PROFILE_STATUS_FILTERS.needActForShow.label),
    ).toBeDefined();
  });

  it("shows public separators between status labels", () => {
    const { container } = render(
      <StatusDisplay
        onPublicProfile
        profile={makeProfile({
          openToCollaboration: true,
          openToGigs: true,
          needActForShow: true,
        })}
      />,
    );

    expect(
      [...container.querySelectorAll("span")].filter(
        (node) => node.textContent === "|",
      ),
    ).toHaveLength(2);
  });

  it("lets viewers open the status message modal off the public profile", () => {
    render(
      <StatusDisplay
        profile={makeProfile({
          openToCollaboration: true,
          statusMessage: "Looking for a drummer this weekend",
        })}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /View Status Message/i }));

    expect(
      screen.getByText('"Looking for a drummer this weekend"'),
    ).toBeDefined();
    expect(
      screen.getByText("A message from Test Band"),
    ).toBeDefined();
  });

  it("hides the status message control on public profiles", () => {
    render(
      <StatusDisplay
        onPublicProfile
        profile={makeProfile({
          statusMessage: "Looking for a drummer this weekend",
        })}
      />,
    );

    expect(
      screen.queryByRole("button", { name: /View Status Message/i }),
    ).toBeNull();
  });
});
