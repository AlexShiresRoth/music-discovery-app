import RootLayout from "@/app/layout";
import { HAS_VISITED_COOKIE } from "@/lib/has-visited";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockCookieGet } = vi.hoisted(() => ({
  mockCookieGet: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: mockCookieGet,
  })),
}));

vi.mock("next/font/google", () => ({
  Geist: () => ({ variable: "--font-geist-sans" }),
  Geist_Mono: () => ({ variable: "--font-geist-mono" }),
}));

vi.mock("@/components/navigation", () => ({
  default: () => <nav>Navigation</nav>,
}));

vi.mock("@/components/toast-wrapper", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/context/toast", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/feed-overlay", () => ({
  default: () => <header>Intro header</header>,
}));

describe("RootLayout visit cookie", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the intro when the visit cookie is unset", async () => {
    mockCookieGet.mockReturnValue(undefined);

    const ui = await RootLayout({ children: <div>Feed</div> });
    render(ui);

    expect(screen.getByText("Intro header")).toBeDefined();
    expect(mockCookieGet).toHaveBeenCalledWith(HAS_VISITED_COOKIE);
  });

  it("omits the intro when the visit cookie is true", async () => {
    mockCookieGet.mockReturnValue({ value: "true" });

    const ui = await RootLayout({ children: <div>Feed</div> });
    render(ui);

    expect(screen.queryByText("Intro header")).toBeNull();
  });
});
