import AccountActions from "@/app/account/actions";
import { ToastContext } from "@/context/toast";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: vi.fn() }),
}));

function renderActions(setToast = vi.fn()) {
  return render(
    <ToastContext.Provider value={{ toast: null, setToast }}>
      <AccountActions />
    </ToastContext.Provider>,
  );
}

describe("AccountActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
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

  it("submits a feature request and shows a success toast", async () => {
    const setToast = vi.fn();
    renderActions(setToast);

    fireEvent.click(screen.getByRole("button", { name: "Submit a request" }));
    fireEvent.change(screen.getByPlaceholderText("Describe the feature..."), {
      target: { value: "Add playlist sharing" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit request" }));

    await waitFor(() => {
      expect(setToast).toHaveBeenCalledWith({
        message: "Feature request submitted",
        type: "success",
      });
    });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("deletes the account after confirmation", async () => {
    const setToast = vi.fn();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ message: "Account deleted successfully" }),
    });

    renderActions(setToast);
    fireEvent.click(screen.getByRole("button", { name: "Delete account" }));
    const confirmButtons = screen.getAllByRole("button", {
      name: "Delete account",
    });
    fireEvent.click(confirmButtons[confirmButtons.length - 1]!);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/account/delete", {
        method: "DELETE",
      });
      expect(setToast).toHaveBeenCalledWith({
        message: "Account deleted successfully",
        type: "success",
      });
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });
});
