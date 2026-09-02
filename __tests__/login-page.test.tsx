import SignInPage from "@/app/login/page";
import { ToastContext } from "@/context/toast";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetSession = vi.fn();
const mockRedirect = vi.fn((url: string) => {
  throw new Error(`NEXT_REDIRECT:${url}`);
});

vi.mock("@/lib/auth", () => ({
  getSession: () => mockGetSession(),
}));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => mockRedirect(url),
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: { signInWithOAuth: vi.fn() },
  }),
}));

function renderPage(page: React.ReactNode) {
  return render(
    <ToastContext.Provider value={{ toast: null, setToast: vi.fn() }}>
      {page}
    </ToastContext.Provider>,
  );
}

describe("SignInPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue(null);
  });

  it("redirects authenticated users home", async () => {
    mockGetSession.mockResolvedValue({ id: "user-1" });

    await expect(
      SignInPage({ searchParams: Promise.resolve({}) }),
    ).rejects.toThrow("NEXT_REDIRECT:/");
    expect(mockRedirect).toHaveBeenCalledWith("/");
  });

  it("renders login heading and form by default", async () => {
    const page = await SignInPage({ searchParams: Promise.resolve({}) });
    renderPage(page);

    expect(screen.getByText("Welcome to Side0")).toBeDefined();
    expect(screen.getByPlaceholderText("Email")).toBeDefined();
    expect(screen.queryByPlaceholderText("Confirm Password")).toBeNull();
    expect(screen.getByText("Continue with Google")).toBeDefined();
  });

  it("renders register heading and confirm password when register=true", async () => {
    const page = await SignInPage({
      searchParams: Promise.resolve({ register: "true" }),
    });
    renderPage(page);

    expect(screen.getByText("Create an account")).toBeDefined();
    expect(screen.getByPlaceholderText("Confirm Password")).toBeDefined();
  });
});
