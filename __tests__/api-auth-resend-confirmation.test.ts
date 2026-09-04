import { POST } from "@/app/auth/resend-confirmation/route";
import { enforceRateLimit } from "@/lib/db/redis";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockResend = vi.fn();
const mockEnforceRateLimit = vi.mocked(enforceRateLimit);

vi.mock("@/lib/auth", () => ({
  createServerClient: vi.fn(async () => ({
    auth: {
      resend: mockResend,
    },
  })),
}));

function makeRequest(body: unknown, ip = "1.2.3.4") {
  return new Request("http://localhost/auth/resend-confirmation", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": ip,
    },
    body: JSON.stringify(body),
  });
}

describe("POST /auth/resend-confirmation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
    mockEnforceRateLimit.mockResolvedValue(undefined);
  });

  it("returns 400 when email is missing", async () => {
    const response = await POST(makeRequest({}));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Email is required");
    expect(mockResend).not.toHaveBeenCalled();
  });

  it("rate limits by IP before reading the body email key", async () => {
    mockEnforceRateLimit.mockResolvedValueOnce(
      Response.json(
        { message: "Too many requests. Try again later." },
        { status: 429 },
      ),
    );

    const response = await POST(makeRequest({ email: "user@example.com" }));

    expect(response.status).toBe(429);
    expect(mockEnforceRateLimit).toHaveBeenCalledWith("authEmail", "ip:1.2.3.4");
    expect(mockResend).not.toHaveBeenCalled();
  });

  it("rate limits by normalized email", async () => {
    mockEnforceRateLimit
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(
        Response.json(
          { message: "Too many requests. Try again later." },
          { status: 429 },
        ),
      );

    const response = await POST(
      makeRequest({ email: "  User@Example.com " }),
    );

    expect(response.status).toBe(429);
    expect(mockEnforceRateLimit).toHaveBeenNthCalledWith(
      1,
      "authEmail",
      "ip:1.2.3.4",
    );
    expect(mockEnforceRateLimit).toHaveBeenNthCalledWith(
      2,
      "authEmail",
      "email:user@example.com",
    );
    expect(mockResend).not.toHaveBeenCalled();
  });

  it("resends a signup confirmation email", async () => {
    mockResend.mockResolvedValue({ data: {}, error: null });

    const response = await POST(
      makeRequest({ email: "  User@Example.com " }),
    );
    const body = await response.json();

    expect(mockResend).toHaveBeenCalledWith({
      type: "signup",
      email: "user@example.com",
      options: {
        emailRedirectTo: "http://localhost:3000",
      },
    });
    expect(response.status).toBe(200);
    expect(body.message).toBe("Confirmation email sent");
  });

  it("returns 400 when supabase resend fails", async () => {
    mockResend.mockResolvedValue({
      data: {},
      error: { message: "For security purposes, you can only request this after 60 seconds." },
    });

    const response = await POST(makeRequest({ email: "user@example.com" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain("60 seconds");
  });
});
