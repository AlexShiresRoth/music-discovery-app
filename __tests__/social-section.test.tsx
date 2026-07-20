import SocialSection from "@/app/profile/social";
import { ToastContext } from "@/context/toast";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

const baseProps = {
  website: null,
  facebook: null,
  instagram: null,
  tiktok: null,
  spotify: null,
  appleMusic: null,
  soundcloud: null,
  bandcamp: null,
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
      expect(screen.getByText("Instagram")).toBeDefined();
      expect(screen.getByText("TikTok")).toBeDefined();
      expect(screen.getByText("Spotify")).toBeDefined();
      expect(screen.getByText("Apple Music")).toBeDefined();
      expect(screen.getByText("SoundCloud")).toBeDefined();
      expect(screen.getByText("Bandcamp")).toBeDefined();
    });

    it("shows fallback text when no links are set", () => {
      renderWithToast();
      expect(screen.getByText("www.mywebsite.com")).toBeDefined();
      expect(screen.getByText("www.instagram.com/myprofile")).toBeDefined();
    });

    it("shows the link value as a clickable URL when provided", () => {
      renderWithToast({ website: "https://myband.com" });
      const link = screen.getByRole("link", { name: "https://myband.com" });
      expect(link.getAttribute("href")).toBe("https://myband.com");
      expect(link.getAttribute("target")).toBe("_blank");
    });

    it("shows an Edit link pointing to /profile/edit/social", () => {
      const { container } = renderWithToast();
      const link = container.querySelector(
        'a[href="/profile/edit/social"]',
      );
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
      expect(screen.getByPlaceholderText("Website URL")).toBeDefined();
      expect(screen.getByPlaceholderText("Instagram URL")).toBeDefined();
      expect(screen.getByPlaceholderText("TikTok URL")).toBeDefined();
      expect(screen.getByPlaceholderText("Spotify URL")).toBeDefined();
      expect(screen.getByPlaceholderText("Apple Music URL")).toBeDefined();
      expect(screen.getByPlaceholderText("SoundCloud URL")).toBeDefined();
      expect(screen.getByPlaceholderText("Bandcamp URL")).toBeDefined();
    });

    it("pre-fills inputs with existing values", () => {
      renderWithToast({
        mode: "Edit",
        website: "https://myband.com",
        instagram: "myband",
      });
      expect(screen.getByDisplayValue("https://myband.com")).toBeDefined();
      expect(screen.getByDisplayValue("myband")).toBeDefined();
    });

    it("shows the Save button and no Edit link", () => {
      const { container } = renderWithToast({ mode: "Edit" });
      const saveButton = screen.getByRole("button", { name: "Save" });
      expect(saveButton).toBeDefined();
      expect(saveButton.className).toContain("bg-amber-500");
      expect(
        container.querySelector('a[href="/profile/edit/social"]'),
      ).toBeNull();
    });

    it("navigates to /profile when the close button is clicked", () => {
      const { container } = renderWithToast({ mode: "Edit" });
      fireEvent.click(container.querySelector('button[type="button"]')!);
      expect(mockPush).toHaveBeenCalledWith("/profile");
    });

    it("posts to /api/profile/edit on submit", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });
      const { container } = renderWithToast({ mode: "Edit" });

      fireEvent.submit(container.querySelector("form")!);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/profile/edit",
          expect.objectContaining({
            method: "POST",
            headers: { "Content-Type": "application/json" },
          }),
        );
      });
    });

    it("shows success toast and navigates to /profile on success", async () => {
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
        expect(mockPush).toHaveBeenCalledWith("/profile");
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
