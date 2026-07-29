import { GET } from "@/app/auth/confirm/route";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockVerifyOtp = vi.fn();
const mockRedirect = vi.fn((url: string) => {
  throw new Error(`NEXT_REDIRECT:${url}`);
});

vi.mock("@/lib/auth", () => ({
  createServerClient: vi.fn(async () => ({
    auth: { verifyOtp: mockVerifyOtp },
  })),
}));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => mockRedirect(url),
}));

describe("GET /auth/confirm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("verifies the otp and redirects to next on success", async () => {
    mockVerifyOtp.mockResolvedValue({ error: null });

    await expect(
      GET(
        new NextRequest(
          "http://localhost:3000/auth/confirm?token_hash=abc&type=signup&next=/profile",
        ),
      ),
    ).rejects.toThrow("NEXT_REDIRECT:/profile");

    expect(mockVerifyOtp).toHaveBeenCalledWith({
      type: "signup",
      token_hash: "abc",
    });
    expect(mockRedirect).toHaveBeenCalledWith("/profile");
  });

  it("defaults next to / when omitted", async () => {
    mockVerifyOtp.mockResolvedValue({ error: null });

    await expect(
      GET(
        new NextRequest(
          "http://localhost:3000/auth/confirm?token_hash=abc&type=email",
        ),
      ),
    ).rejects.toThrow("NEXT_REDIRECT:/");

    expect(mockRedirect).toHaveBeenCalledWith("/");
  });

  it("redirects to auth-code-error when verification fails", async () => {
    mockVerifyOtp.mockResolvedValue({
      error: { message: "Token has expired or is invalid" },
    });

    await expect(
      GET(
        new NextRequest(
          "http://localhost:3000/auth/confirm?token_hash=bad&type=signup",
        ),
      ),
    ).rejects.toThrow("NEXT_REDIRECT:/auth/auth-code-error");

    expect(mockRedirect).toHaveBeenCalledWith("/auth/auth-code-error");
  });

  it("redirects to auth-code-error when token_hash or type is missing", async () => {
    await expect(
      GET(new NextRequest("http://localhost:3000/auth/confirm")),
    ).rejects.toThrow("NEXT_REDIRECT:/auth/auth-code-error");

    expect(mockVerifyOtp).not.toHaveBeenCalled();
    expect(mockRedirect).toHaveBeenCalledWith("/auth/auth-code-error");
  });
});
