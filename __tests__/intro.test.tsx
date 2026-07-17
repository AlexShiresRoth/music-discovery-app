import ChooseProfile from "@/app/profile/intro";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("ChooseProfile", () => {
  it("links to profile creation with amber styling", () => {
    render(<ChooseProfile />);

    const link = screen.getByRole("link", { name: "Create Profile" });
    expect(link.getAttribute("href")).toBe("/profile/create");
    expect(link.className).toContain("bg-amber-500");
  });
});
