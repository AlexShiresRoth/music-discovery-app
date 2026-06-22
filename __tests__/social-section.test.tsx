import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ToastContext } from "@/context/toast";
import SocialSection from "@/app/profile/artist/social";

const mockBack = vi.fn();
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ back: mockBack, refresh: mockRefresh }),
}));

const baseProps = {
  website: null,
  facebook: null,
  instagram: null,
  tiktok: null,
  spotify: null,
  appleMusic: null,
  soundcloud: null,
};

function renderWithToast(props = {}, setToast = vi.fn()) {
  const { container } = render(
    <ToastContext.Provider value={{ toast: null, setToast }}>
      <SocialSection {...baseProps} {...props} />
    </ToastContext.Provider>,
  );
  return { container, setToast };
}

describe("SocialSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe("view mode", () => {
    it("renders the section heading", () => {
      renderWithToast();
      expect(screen.getByText("Social Links")).toBeDefined();
    });

    it("renders all platform labels", () => {
      renderWithToast();
      expect(screen.getByText("Website")).toBeDefined();
      expect(screen.getByText("Facebook")).toBeDefined();
      expect(screen.getByText("Instagram")).toBeDefined();
      expect(screen.getByText("TikTok")).toBeDefined();
      expect(screen.getByText("Spotify")).toBeDefined();
      expect(screen.getByText("Apple Music")).toBeDefined();
      expect(screen.getByText("SoundCloud")).toBeDefined();
    });

    it("shows fallback text when no links are set", () => {
      renderWithToast();
      expect(screen.getByText("www.mywebsite.com")).toBeDefined();
      expect(screen.getByText("www.facebook.com/myartist")).toBeDefined();
    });

    it("shows the link value when a link is provided", () => {
      renderWithToast({ website: "https://myband.com" });
      expect(screen.getByText("https://myband.com")).toBeDefined();
    });

    it("shows an Edit link pointing to /profile/artist/edit/social", () => {
      const { container } = renderWithToast();
      const link = container.querySelector('a[href="/profile/artist/edit/social"]');
      expect(link).not.toBeNull();
    });

    it("does not render a Save button in view mode", () => {
      renderWithToast();
      expect(screen.queryByRole("button", { name: /save/i })).toBeNull();
    });
  });

  describe("edit mode", () => {
    it("renders text inputs for each social platform", () => {
      renderWithToast({ mode: "Edit" });
      expect(screen.getByPlaceholderText("Website")).toBeDefined();
      expect(screen.getByPlaceholderText("Facebook")).toBeDefined();
      expect(screen.getByPlaceholderText("Instagram")).toBeDefined();
      expect(screen.getByPlaceholderText("TikTok")).toBeDefined();
      expect(screen.getByPlaceholderText("Spotify")).toBeDefined();
      expect(screen.getByPlaceholderText("Apple Music")).toBeDefined();
      expect(screen.getByPlaceholderText("SoundCloud")).toBeDefined();
    });

    it("pre-fills inputs with existing values", () => {
      renderWithToast({ mode: "Edit", website: "https://myband.com", instagram: "myband" });
      expect(screen.getByDisplayValue("https://myband.com")).toBeDefined();
      expect(screen.getByDisplayValue("myband")).toBeDefined();
    });

    it("shows the Save button and no Edit link", () => {
      const { container } = renderWithToast({ mode: "Edit" });
      expect(screen.getByRole("button", { name: "Save" })).toBeDefined();
      expect(container.querySelector('a[href="/profile/artist/edit/social"]')).toBeNull();
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
        json: async () => ({ error: "Social update failed" }),
      });
      const setToast = vi.fn();
      const { container } = renderWithToast({ mode: "Edit" }, setToast);

      fireEvent.submit(container.querySelector("form")!);

      await waitFor(() => {
        expect(setToast).toHaveBeenCalledWith({
          message: "Social update failed",
          type: "error",
        });
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
