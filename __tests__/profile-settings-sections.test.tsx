import ProfileSettingsSections from "@/app/profile/settings/sections";
import { ToastContext } from "@/context/toast";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

function renderSettings(
  props: { hasProfile?: boolean; isPublic?: boolean } = {},
  setToast = vi.fn(),
) {
  return render(
    <ToastContext.Provider value={{ toast: null, setToast }}>
      <ProfileSettingsSections
        hasProfile={props.hasProfile ?? true}
        isPublic={props.isPublic ?? true}
      />
    </ToastContext.Provider>,
  );
}

describe("ProfileSettingsSections", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("shows Hide Profile when the profile is public", () => {
    renderSettings({ isPublic: true });
    expect(screen.getByRole("button", { name: "Hide Profile" })).toBeDefined();
  });

  it("shows Make Profile Public when the profile is hidden", () => {
    renderSettings({ isPublic: false });
    expect(
      screen.getByRole("button", { name: "Make Profile Public" }),
    ).toBeDefined();
  });

  it("hides the visibility toggle when the user has no profile", () => {
    renderSettings({ hasProfile: false });
    expect(screen.queryByRole("button", { name: /Hide Profile|Make Profile Public/ })).toBeNull();
  });

  it("toggles visibility and refreshes on success", async () => {
    const setToast = vi.fn();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ message: "Profile hidden successfully" }),
    });

    renderSettings({ isPublic: true }, setToast);
    fireEvent.click(screen.getByRole("button", { name: "Hide Profile" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/profile/hide");
      expect(setToast).toHaveBeenCalledWith({
        message: "Profile hidden successfully",
        type: "success",
      });
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("shows an error toast when hide fails", async () => {
    const setToast = vi.fn();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Unauthorized" }),
    });

    renderSettings({ isPublic: true }, setToast);
    fireEvent.click(screen.getByRole("button", { name: "Hide Profile" }));

    await waitFor(() => {
      expect(setToast).toHaveBeenCalledWith({
        message: "Unauthorized",
        type: "error",
      });
      expect(mockRefresh).not.toHaveBeenCalled();
    });
  });
});
