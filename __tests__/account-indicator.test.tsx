import AccountIndicator from "@/components/account-indicator";
import type { User } from "@supabase/supabase-js";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

const user = {
  id: "user-1",
  email: "artist@side0.com",
} as User;

describe("AccountIndicator", () => {
  it("renders nothing when signed out", () => {
    const { container } = render(<AccountIndicator user={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("links to account settings with the user email when signed in", () => {
    render(<AccountIndicator user={user} />);

    const link = screen.getByRole("link", { name: /artist@side0\.com/i });
    expect(link).toHaveProperty("href", "http://localhost:3000/account");
    expect(screen.getByText("artist@side0.com")).toBeDefined();
  });
});
