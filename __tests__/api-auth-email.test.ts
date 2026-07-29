import { POST } from "@/app/auth/email/route";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockSignUp = vi.fn();
const mockSignInWithPassword = vi.fn();

vi.mock("@/lib/auth", () => ({
  createServerClient: vi.fn(async () => ({
    auth: {
      signUp: mockSignUp,
      signInWithPassword: mockSignInWithPassword,
    },
  })),
}));

function makeRequest(body: object, register = false) {
  const url = register
    ? "http://localhost/auth/email?register=true"
    : "http://localhost/auth/email";
  return new Request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /auth/email", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
  });

  describe("login", () => {
    it("signs in with email and password", async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: { id: "user-1" }, session: { access_token: "token" } },
        error: null,
      });

      const response = await POST(
        makeRequest({ email: "user@example.com", password: "secret123" }),
      );
      const body = await response.json();

      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: "user@example.com",
        password: "secret123",
      });
      expect(mockSignUp).not.toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(body.user.id).toBe("user-1");
    });

    it("returns 400 when sign-in fails", async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: "Invalid login credentials" },
      });

      const response = await POST(
        makeRequest({ email: "user@example.com", password: "wrong" }),
      );
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe("Invalid login credentials");
    });
  });

  describe("register", () => {
    it("signs up with emailRedirectTo and returns data", async () => {
      mockSignUp.mockResolvedValue({
        data: { user: { id: "user-2" }, session: null },
        error: null,
      });

      const response = await POST(
        makeRequest(
          { email: "new@example.com", password: "secret123" },
          true,
        ),
      );
      const body = await response.json();

      expect(mockSignUp).toHaveBeenCalledWith({
        email: "new@example.com",
        password: "secret123",
        options: {
          emailRedirectTo: "http://localhost:3000",
        },
      });
      expect(mockSignInWithPassword).not.toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(body.user.id).toBe("user-2");
    });

    it("returns 400 when sign-up fails", async () => {
      mockSignUp.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: "User already registered" },
      });

      const response = await POST(
        makeRequest(
          { email: "taken@example.com", password: "secret123" },
          true,
        ),
      );
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe("User already registered");
    });
  });
});
