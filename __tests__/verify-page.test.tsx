import VerifyPage from "@/app/profile/verify/page";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetStatus, mockRedirect } = vi.hoisted(() => ({
  mockGetStatus: vi.fn(),
  mockRedirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

vi.mock("@/lib/profile/verification", () => ({
  getProfileVerificationStatus: (...args: unknown[]) =>
    mockGetStatus(...args),
}));

vi.mock("next/navigation", () => ({
  redirect: mockRedirect,
}));

vi.mock("@/components/breadcrumbs", () => ({
  default: () => <div>Back</div>,
}));

vi.mock("@/app/profile/verify/verification", () => ({
  default: () => <div>Verification form</div>,
}));

describe("VerifyPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the verification form when there is no request", async () => {
    mockGetStatus.mockResolvedValue(null);

    const ui = await VerifyPage();
    const { render, screen } = await import("@testing-library/react");
    render(ui);

    expect(screen.getByText("Verification form")).toBeDefined();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("redirects to profile when a request is already open", async () => {
    mockGetStatus.mockResolvedValue("open");

    await expect(VerifyPage()).rejects.toThrow("REDIRECT:/profile");
    expect(mockRedirect).toHaveBeenCalledWith("/profile");
  });

  it("redirects to profile when a request is already resolved", async () => {
    mockGetStatus.mockResolvedValue("resolved");

    await expect(VerifyPage()).rejects.toThrow("REDIRECT:/profile");
    expect(mockRedirect).toHaveBeenCalledWith("/profile");
  });
});
