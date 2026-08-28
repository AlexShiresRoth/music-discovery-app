import AccountActions from "@/app/account/actions";
import { ToastContext } from "@/context/toast";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mockUseDeviceType, mockHandleInstall, mockTrack } = vi.hoisted(() => ({
  mockUseDeviceType: vi.fn(),
  mockHandleInstall: vi.fn(),
  mockTrack: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("@/stores/use-device-type", () => ({
  useDeviceType: () => mockUseDeviceType(),
}));

vi.mock("@/stores/use-install", () => ({
  handleInstall: (...args: unknown[]) => mockHandleInstall(...args),
}));

vi.mock("@vercel/analytics", () => ({
  track: (...args: unknown[]) => mockTrack(...args),
}));

function renderActions(setToast = vi.fn()) {
  return render(
    <ToastContext.Provider value={{ toast: null, setToast }}>
      <AccountActions />
    </ToastContext.Provider>,
  );
}

function openAndConfirmDelete() {
  fireEvent.click(screen.getByRole("button", { name: "Delete account" }));
  const confirmButtons = screen.getAllByRole("button", {
    name: "Delete account",
  });
  fireEvent.click(confirmButtons[confirmButtons.length - 1]!);
}

describe("AccountActions", () => {
  const assignSpy = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    mockUseDeviceType.mockReturnValue({
      isIOS: false,
      isMacOS: false,
      isStandalone: false,
    });
    vi.stubGlobal("location", {
      ...window.location,
      assign: assignSpy,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the three account action triggers", () => {
    renderActions();

    expect(
      screen.getByRole("button", { name: "Submit a request" }),
    ).toBeDefined();
    expect(
      screen.getByRole("button", { name: "Submit a report" }),
    ).toBeDefined();
    expect(screen.getByRole("button", { name: "Delete account" })).toBeDefined();
  });

  it("shows an install button for non-Apple browsers", () => {
    renderActions();

    expect(screen.getByText("Install the app.")).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "Install Side0" }));
    expect(mockHandleInstall).toHaveBeenCalledTimes(1);
    expect(mockTrack).toHaveBeenCalledWith("install_button_from_settings");
  });

  it("shows iOS install instructions without an install button", () => {
    mockUseDeviceType.mockReturnValue({
      isIOS: true,
      isMacOS: false,
      isStandalone: false,
    });
    renderActions();

    expect(screen.getByText(/Add to Home Screen/i)).toBeDefined();
    expect(screen.queryByRole("button", { name: "Install Side0" })).toBeNull();
  });

  it("shows macOS install instructions without an install button", () => {
    mockUseDeviceType.mockReturnValue({
      isIOS: false,
      isMacOS: true,
      isStandalone: false,
    });
    renderActions();

    expect(screen.getByText(/icon in the URL bar/i)).toBeDefined();
    expect(screen.queryByRole("button", { name: "Install Side0" })).toBeNull();
  });

  it("hides install guidance when already running standalone", () => {
    mockUseDeviceType.mockReturnValue({
      isIOS: false,
      isMacOS: false,
      isStandalone: true,
    });
    renderActions();

    expect(screen.queryByText("Install the app.")).toBeNull();
    expect(screen.queryByRole("button", { name: "Install Side0" })).toBeNull();
  });

  it("opens the feature request modal", () => {
    renderActions();
    fireEvent.click(screen.getByRole("button", { name: "Submit a request" }));
    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByText("Feature Request")).toBeDefined();
  });

  it("opens the bug report modal", () => {
    renderActions();
    fireEvent.click(screen.getByRole("button", { name: "Submit a report" }));
    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByText("Bug Report")).toBeDefined();
  });

  it("opens the delete account modal", () => {
    renderActions();
    fireEvent.click(screen.getByRole("button", { name: "Delete account" }));
    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByText("Delete Account")).toBeDefined();
  });

  it("closes a modal when Cancel is clicked", () => {
    renderActions();
    fireEvent.click(screen.getByRole("button", { name: "Submit a request" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("shows an error toast when feature request message is empty", async () => {
    const setToast = vi.fn();
    renderActions(setToast);

    fireEvent.click(screen.getByRole("button", { name: "Submit a request" }));
    fireEvent.change(screen.getByPlaceholderText("Describe the feature..."), {
      target: { value: "   " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit request" }));

    await waitFor(() => {
      expect(setToast).toHaveBeenCalledWith({
        message: "Please enter a message",
        type: "error",
      });
    });
    expect(global.fetch).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeDefined();
  });

  it("submits a feature request and shows a success toast", async () => {
    const setToast = vi.fn();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ message: "Feature request submitted" }),
    });
    renderActions(setToast);

    fireEvent.click(screen.getByRole("button", { name: "Submit a request" }));
    fireEvent.change(screen.getByPlaceholderText("Describe the feature..."), {
      target: { value: "Add playlist sharing" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit request" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/feature-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Add playlist sharing" }),
      });
      expect(setToast).toHaveBeenCalledWith({
        message: "Feature request submitted",
        type: "success",
      });
    });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("shows an error toast when feature request submission fails", async () => {
    const setToast = vi.fn();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Unauthorized" }),
    });
    renderActions(setToast);

    fireEvent.click(screen.getByRole("button", { name: "Submit a request" }));
    fireEvent.change(screen.getByPlaceholderText("Describe the feature..."), {
      target: { value: "Add playlists" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit request" }));

    await waitFor(() => {
      expect(setToast).toHaveBeenCalledWith({
        message: "Unauthorized",
        type: "error",
      });
    });
    expect(screen.getByRole("dialog")).toBeDefined();
  });

  it("submits a bug report through the bug reports endpoint", async () => {
    const setToast = vi.fn();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ message: "Bug report submitted" }),
    });
    renderActions(setToast);

    fireEvent.click(screen.getByRole("button", { name: "Submit a report" }));
    fireEvent.change(screen.getByPlaceholderText("Describe the bug..."), {
      target: { value: "Audio skips" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit report" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/bug-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Audio skips" }),
      });
      expect(setToast).toHaveBeenCalledWith({
        message: "Bug report submitted",
        type: "success",
      });
    });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("shows an error toast when bug report submission fails", async () => {
    const setToast = vi.fn();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Failed to submit" }),
    });
    renderActions(setToast);

    fireEvent.click(screen.getByRole("button", { name: "Submit a report" }));
    fireEvent.change(screen.getByPlaceholderText("Describe the bug..."), {
      target: { value: "Crash on load" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit report" }));

    await waitFor(() => {
      expect(setToast).toHaveBeenCalledWith({
        message: "Failed to submit",
        type: "error",
      });
    });
  });

  it("deletes the account then force-logs out via /logout", async () => {
    const setToast = vi.fn();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ message: "Account deleted successfully" }),
    });

    renderActions(setToast);
    openAndConfirmDelete();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/account/delete", {
        method: "DELETE",
      });
      expect(setToast).toHaveBeenCalledWith({
        message: "Account deleted successfully",
        type: "success",
      });
      expect(assignSpy).toHaveBeenCalledWith("/logout");
    });
  });

  it("shows an error toast when account deletion fails", async () => {
    const setToast = vi.fn();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Failed to delete account" }),
    });

    renderActions(setToast);
    openAndConfirmDelete();

    await waitFor(() => {
      expect(setToast).toHaveBeenCalledWith({
        message: "Failed to delete account",
        type: "error",
      });
    });
    expect(assignSpy).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeDefined();
  });

  it("shows a generic error toast when account deletion throws", async () => {
    const setToast = vi.fn();
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("network"),
    );

    renderActions(setToast);
    openAndConfirmDelete();

    await waitFor(() => {
      expect(setToast).toHaveBeenCalledWith({
        message: "An error occurred",
        type: "error",
      });
    });
    expect(assignSpy).not.toHaveBeenCalled();
  });
});
