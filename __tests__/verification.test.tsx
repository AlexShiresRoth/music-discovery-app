import Verification from "@/app/profile/verify/verification";
import { ToastContext } from "@/context/toast";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockPush } = vi.hoisted(() => ({
  mockPush: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

function renderVerification(setToast = vi.fn()) {
  return render(
    <ToastContext.Provider value={{ toast: null, setToast }}>
      <Verification />
    </ToastContext.Provider>,
  );
}

describe("Verification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("renders the request verification CTA", () => {
    renderVerification();

    expect(
      screen.getByRole("heading", {
        name: /verify your account/i,
      }),
    ).toBeDefined();
    expect(
      screen.getByRole("button", { name: "Request Verification" }),
    ).toBeDefined();
  });

  it("submits a verification request and redirects on success", async () => {
    const setToast = vi.fn();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
    });

    renderVerification(setToast);
    fireEvent.click(
      screen.getByRole("button", { name: "Request Verification" }),
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/profile/verify", {
        method: "POST",
      });
      expect(setToast).toHaveBeenCalledWith({
        message: "Profile verification request submitted",
        type: "success",
      });
      expect(mockPush).toHaveBeenCalledWith("/profile");
    });
  });

  it("shows an error toast when the request fails", async () => {
    const setToast = vi.fn();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
    });

    renderVerification(setToast);
    fireEvent.click(
      screen.getByRole("button", { name: "Request Verification" }),
    );

    await waitFor(() => {
      expect(setToast).toHaveBeenCalledWith({
        message: "Failed to request profile verification",
        type: "error",
      });
    });
    expect(mockPush).not.toHaveBeenCalled();
  });
});
