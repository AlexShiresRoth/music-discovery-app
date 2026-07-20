import SocialSection from "@/app/profile/social";
import { ToastContext } from "@/context/toast";
import type { SocialField } from "@/lib/db/types";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

const social = (url = "", show = true): SocialField => ({ url, show });

const baseProps = {
  website: social(),
  facebook: social(),
  instagram: social(),
  tiktok: social(),
  spotify: social(),
  appleMusic: social(),
  soundcloud: social(),
  bandcamp: social(),
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
      renderWithToast({ website: social("https://myband.com") });
      const link = screen.getByRole("link", { name: "https://myband.com" });
      expect(link.getAttribute("href")).toBe("https://myband.com");
      expect(link.getAttribute("target")).toBe("_blank");
    });

    it("shows an Edit link pointing to /profile/edit/social", () => {
      const { container } = renderWithToast();
      const link = container.querySelector('a[href="/profile/edit/social"]');
      expect(link).not.toBeNull();
    });

    it("does not render a Save button in view mode", () => {
      renderWithToast();
      expect(screen.queryByRole("button", { name: /save/i })).toBeNull();
    });

    it("shows a visibility toggle only when a link is set", () => {
      renderWithToast({
        website: social("https://myband.com"),
        instagram: social(),
      });

      expect(screen.getByRole("switch", { name: "Show Website" })).toBeDefined();
      expect(screen.queryByRole("switch", { name: "Show Instagram" })).toBeNull();
    });

    it("posts show:false when toggling a visible link off", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      renderWithToast({
        website: social("https://myband.com", true),
      });

      fireEvent.click(screen.getByRole("switch", { name: "Show Website" }));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/profile/edit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            website: { url: "https://myband.com", show: false },
          }),
        });
        expect(mockRefresh).toHaveBeenCalled();
      });
    });

    it("posts show:true when toggling a hidden link on", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      renderWithToast({
        instagram: social("https://instagram.com/myband", false),
      });

      fireEvent.click(screen.getByRole("switch", { name: "Show Instagram" }));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/profile/edit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            instagram: {
              url: "https://instagram.com/myband",
              show: true,
            },
          }),
        });
      });
    });

    it("rolls back the toggle and shows a toast when the request fails", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Visibility update failed" }),
      });
      const setToast = vi.fn();

      renderWithToast(
        { website: social("https://myband.com", true) },
        setToast,
      );

      const toggle = screen.getByRole("switch", { name: "Show Website" });
      expect(toggle.getAttribute("aria-checked")).toBe("true");

      fireEvent.click(toggle);

      await waitFor(() => {
        expect(setToast).toHaveBeenCalledWith({
          message: "Visibility update failed",
          type: "error",
        });
        expect(toggle.getAttribute("aria-checked")).toBe("true");
        expect(mockRefresh).not.toHaveBeenCalled();
      });
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
        website: social("https://myband.com"),
        instagram: social("myband"),
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

    it("posts SocialField objects including show on submit", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });
      const { container } = renderWithToast({
        mode: "Edit",
        website: social("https://myband.com", false),
        instagram: social("https://instagram.com/myband", true),
      });

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

      const body = JSON.parse(
        (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body,
      );
      expect(body.website).toEqual({
        url: "https://myband.com",
        show: false,
      });
      expect(body.instagram).toEqual({
        url: "https://instagram.com/myband",
        show: true,
      });
      expect(body.spotify).toEqual({ url: "", show: true });
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
