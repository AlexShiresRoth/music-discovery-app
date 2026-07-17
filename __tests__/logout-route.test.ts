import { GET } from "@/app/logout/route";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockSignOut = vi.fn();
const mockCookieGetAll = vi.fn(() => []);
const mockCookieSet = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    auth: { signOut: mockSignOut },
  })),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    getAll: mockCookieGetAll,
    set: mockCookieSet,
  })),
}));

describe("GET /logout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "test-key";
  });

  it("signs out and redirects home", async () => {
    mockSignOut.mockResolvedValue({ error: null });

    const response = await GET(new Request("http://localhost:3000/logout"));

    expect(mockSignOut).toHaveBeenCalled();
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/");
  });
});
