import SignInButton from "@/app/login/auth-button";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockSignInWithOAuth, mockUseSearchParams } = vi.hoisted(() => ({
  mockSignInWithOAuth: vi.fn(),
  mockUseSearchParams: vi.fn(() => new URLSearchParams()),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signInWithOAuth: mockSignInWithOAuth,
    },
  }),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => mockUseSearchParams(),
}));

describe("SignInButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSearchParams.mockReturnValue(new URLSearchParams());
    vi.stubGlobal("location", {
      origin: "http://localhost:3000",
    });
  });

  it("renders children", () => {
    render(
      <SignInButton provider="google">Continue with Google</SignInButton>,
    );
    expect(screen.getByText("Continue with Google")).toBeDefined();
  });

  it("starts OAuth with the provider and auth callback redirect", async () => {
    mockSignInWithOAuth.mockResolvedValue({ data: {}, error: null });

    render(
      <SignInButton provider="google">Continue with Google</SignInButton>,
    );
    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: "google",
        options: {
          redirectTo: "http://localhost:3000/auth/callback",
        },
      });
    });
  });

  it("includes next=/profile when register=true", async () => {
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams("register=true"),
    );
    mockSignInWithOAuth.mockResolvedValue({ data: {}, error: null });

    render(
      <SignInButton provider="google">Continue with Google</SignInButton>,
    );
    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: "google",
        options: {
          redirectTo: "http://localhost:3000/auth/callback?next=/profile",
        },
      });
    });
  });

  it("logs OAuth errors without throwing", async () => {
    const error = new Error("OAuth unavailable");
    mockSignInWithOAuth.mockResolvedValue({ data: {}, error });
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(
      <SignInButton provider="github">Continue with Github</SignInButton>,
    );
    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith(error);
    });

    consoleError.mockRestore();
  });
});
