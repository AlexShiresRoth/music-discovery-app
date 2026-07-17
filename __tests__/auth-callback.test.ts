import { GET } from "@/app/auth/callback/route";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockExchangeCodeForSession = vi.fn();
const mockCookieGetAll = vi.fn(() => []);
const mockCookieSet = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    auth: { exchangeCodeForSession: mockExchangeCodeForSession },
  })),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    getAll: mockCookieGetAll,
    set: mockCookieSet,
  })),
}));

describe("GET /auth/callback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "test-key";
  });

  it("exchanges the code and redirects to next on success", async () => {
    mockExchangeCodeForSession.mockResolvedValue({ error: null });

    const response = await GET(
      new Request("http://localhost:3000/auth/callback?code=abc&next=/profile"),
    );

    expect(mockExchangeCodeForSession).toHaveBeenCalledWith("abc");
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/profile",
    );
  });

  it("defaults next to / when omitted", async () => {
    mockExchangeCodeForSession.mockResolvedValue({ error: null });

    const response = await GET(
      new Request("http://localhost:3000/auth/callback?code=abc"),
    );

    expect(response.headers.get("location")).toBe("http://localhost:3000/");
  });

  it("redirects to login when exchange fails", async () => {
    mockExchangeCodeForSession.mockResolvedValue({
      error: new Error("invalid code"),
    });

    const response = await GET(
      new Request("http://localhost:3000/auth/callback?code=bad"),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login",
    );
  });

  it("redirects to login when code is missing", async () => {
    const response = await GET(
      new Request("http://localhost:3000/auth/callback"),
    );

    expect(mockExchangeCodeForSession).not.toHaveBeenCalled();
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login",
    );
  });
});
