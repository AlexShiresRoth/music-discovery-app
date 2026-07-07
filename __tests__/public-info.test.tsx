import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ToastContext } from "@/context/toast";
import PublicInfo from "@/app/profile/artist/public-info";

const mockBack = vi.fn();
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ back: mockBack, refresh: mockRefresh }),
}));

const baseProps = {
  artistName: "Test Artist",
  genre: "Rock",
  members: "John, Jane",
  artistDescription: "A test band",
  city: "New York",
  state: "NY",
  country: "US",
  fullName: "Test User",
  contactEmail: "test@example.com",
  website: null,
  facebook: null,
  instagram: null,
  tiktok: null,
  spotify: null,
  appleMusic: null,
  soundcloud: null,
  artistLogo: null,
  imageUrl: null,
};

function renderWithToast(props = {}, setToast = vi.fn()) {
  const { container } = render(
    <ToastContext.Provider value={{ toast: null, setToast }}>
      <PublicInfo {...baseProps} {...props} />
    </ToastContext.Provider>,
  );
  return { container, setToast };
}

describe("PublicInfo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe("view mode", () => {
    it("renders the section heading", () => {
      renderWithToast();
      expect(screen.getByText("Public Info")).toBeDefined();
    });

    it("displays the artist name", () => {
      renderWithToast();
      expect(screen.getByText("Test Artist")).toBeDefined();
    });

    it("displays genre, members and description", () => {
      renderWithToast();
      expect(screen.getByText("Rock")).toBeDefined();
      expect(screen.getByText("John, Jane")).toBeDefined();
      expect(screen.getByText("A test band")).toBeDefined();
    });

    it("shows an Edit link pointing to /profile/artist/edit/public", () => {
      const { container } = renderWithToast();
      const link = container.querySelector('a[href="/profile/artist/edit/public"]');
      expect(link).not.toBeNull();
    });

    it("does not render a Save button in view mode", () => {
      renderWithToast();
      expect(screen.queryByRole("button", { name: /save/i })).toBeNull();
    });
  });

  describe("edit mode", () => {
    it("renders inputs pre-filled with current values", () => {
      const { container } = renderWithToast({ mode: "Edit" });
      expect(screen.getByDisplayValue("Test Artist")).toBeDefined();
      expect(screen.getByDisplayValue("John, Jane")).toBeDefined();
      // city — query by name to avoid ambiguity with the NY state select label
      const cityInput = container.querySelector<HTMLInputElement>('input[name="city"]');
      expect(cityInput?.value).toBe("New York");
      // country is a SelectInput; check the selected value directly
      const countrySelect = container.querySelector<HTMLSelectElement>('select[name="country"]');
      expect(countrySelect?.value).toBe("US");
    });

    it("shows the Save button", () => {
      renderWithToast({ mode: "Edit" });
      expect(screen.getByRole("button", { name: "Save" })).toBeDefined();
    });

    it("does not show the Edit link", () => {
      const { container } = renderWithToast({ mode: "Edit" });
      expect(
        container.querySelector('a[href="/profile/artist/edit/public"]'),
      ).toBeNull();
    });

    it("calls router.back when the close button is clicked", () => {
      const { container } = renderWithToast({ mode: "Edit" });
      fireEvent.click(container.querySelector('button[type="button"]')!);
      expect(mockBack).toHaveBeenCalled();
    });

    it("posts to /api/profile/artist/edit on submit", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });
      const { container } = renderWithToast({ mode: "Edit" });

      fireEvent.submit(container.querySelector("form")!);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/profile/artist/edit",
          expect.objectContaining({
            method: "POST",
            headers: { "Content-Type": "application/json" },
          }),
        );
      });
    });

    it("shows success toast and calls refresh + back on success", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });
      const setToast = vi.fn();
      const { container } = renderWithToast({ mode: "Edit" }, setToast);

      fireEvent.submit(container.querySelector("form")!);

      await waitFor(() => {
        expect(setToast).toHaveBeenCalledWith({
          message: "Profile updated successfully",
          type: "success",
        });
        expect(mockRefresh).toHaveBeenCalled();
        expect(mockBack).toHaveBeenCalled();
      });
    });

    it("shows API error message in toast on failure", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Update failed" }),
      });
      const setToast = vi.fn();
      const { container } = renderWithToast({ mode: "Edit" }, setToast);

      fireEvent.submit(container.querySelector("form")!);

      await waitFor(() => {
        expect(setToast).toHaveBeenCalledWith({
          message: "Update failed",
          type: "error",
        });
      });
    });

    it("shows default error message when API returns no error string", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({}),
      });
      const setToast = vi.fn();
      const { container } = renderWithToast({ mode: "Edit" }, setToast);

      fireEvent.submit(container.querySelector("form")!);

      await waitFor(() => {
        expect(setToast).toHaveBeenCalledWith({
          message: "Failed to update profile",
          type: "error",
        });
      });
    });

    it("shows error toast when fetch throws", async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));
      const setToast = vi.fn();
      const { container } = renderWithToast({ mode: "Edit" }, setToast);

      fireEvent.submit(container.querySelector("form")!);

      await waitFor(() => {
        expect(setToast).toHaveBeenCalledWith(
          expect.objectContaining({ type: "error" }),
        );
      });
    });

    it("disables Save button and shows Saving during submission", async () => {
      global.fetch = vi.fn().mockImplementation(() => new Promise(() => {}));
      const { container } = renderWithToast({ mode: "Edit" });

      fireEvent.submit(container.querySelector("form")!);

      await waitFor(() => {
        const button = screen.getByRole("button", { name: "Saving" });
        expect(button).toBeDefined();
        expect(button.hasAttribute("disabled")).toBe(true);
      });
    });
  });
});
