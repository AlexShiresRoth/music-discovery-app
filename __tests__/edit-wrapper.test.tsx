import EditWrapper from "@/app/profile/edit/edit-wrapper";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("EditWrapper", () => {
  it("renders children inside the centered layout", () => {
    const { container } = render(
      <EditWrapper>
        <p>Edit content</p>
      </EditWrapper>,
    );

    expect(screen.getByText("Edit content")).toBeDefined();
    expect(container.firstElementChild?.className).toContain("min-h-screen");
    expect(container.firstElementChild?.className).toContain("items-center");
  });
});
