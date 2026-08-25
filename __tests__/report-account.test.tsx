import ReportAccount from "@/components/report-account";
import { ToastContext } from "@/context/toast";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

function renderReport(
  props: { isAuthenticated?: boolean; profileId?: number } = {},
  setToast = vi.fn(),
) {
  return render(
    <ToastContext.Provider value={{ toast: null, setToast }}>
      <ReportAccount
        isAuthenticated={props.isAuthenticated ?? true}
        profileId={props.profileId ?? 12}
      />
    </ToastContext.Provider>,
  );
}

describe("ReportAccount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("opens the report modal", () => {
    renderReport();

    fireEvent.click(screen.getByRole("button"));

    expect(screen.getByRole("dialog")).toBeDefined();
    expect(
      screen.getByRole("heading", { name: "Report Account" }),
    ).toBeDefined();
  });

  it("shows full reason options when authenticated", () => {
    renderReport({ isAuthenticated: true });
    fireEvent.click(screen.getByRole("button"));

    const select = screen.getByRole("combobox");
    expect(select.querySelectorAll("option")).toHaveLength(6);
    expect(screen.getByText("Spam")).toBeDefined();
    expect(screen.getByText("Copyright Infringement")).toBeDefined();
  });

  it("only shows copyright when unauthenticated", () => {
    renderReport({ isAuthenticated: false });
    fireEvent.click(screen.getByRole("button"));

    const select = screen.getByRole("combobox");
    expect(select.querySelectorAll("option")).toHaveLength(1);
    expect(screen.getByText("Copyright Infringement")).toBeDefined();
    expect(screen.queryByText("Spam")).toBeNull();
  });

  it("closes the modal when Cancel is clicked", () => {
    renderReport();
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("submits a report and shows a success toast", async () => {
    const setToast = vi.fn();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({
        message:
          "Thank you for reporting this account. We will review it shortly.",
      }),
    });

    renderReport({ profileId: 42 }, setToast);
    fireEvent.click(screen.getByRole("button"));

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "spam" },
    });
    fireEvent.change(screen.getByPlaceholderText("Description"), {
      target: { value: "This looks like spam" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/account-report", {
        method: "POST",
        body: JSON.stringify({
          profileId: 42,
          reportReason: "spam",
          description: "This looks like spam",
        }),
      });
      expect(setToast).toHaveBeenCalledWith({
        message:
          "Thank you for reporting this account. We will review it shortly.",
        type: "success",
      });
    });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("shows an error toast when the report request fails", async () => {
    const setToast = vi.fn();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      json: async () => ({ message: "Nope" }),
    });

    renderReport({}, setToast);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "spam" },
    });
    fireEvent.change(screen.getByPlaceholderText("Description"), {
      target: { value: "Bad content" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(setToast).toHaveBeenCalledWith({
        message: "Failed to report account",
        type: "error",
      });
    });
    expect(screen.getByRole("dialog")).toBeDefined();
  });
});
