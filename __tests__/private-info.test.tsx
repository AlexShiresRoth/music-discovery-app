import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ToastContext } from "@/context/toast";
import PrivateInfo from "@/app/profile/artist/private-info";

const mockBack = vi.fn();
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ back: mockBack, refresh: mockRefresh }),
}));

const joinedDate = new Date("2024-03-15");
const formattedDate = joinedDate.toLocaleDateString();

const baseProps = {
  fullName: "Test User",
  contactEmail: "test@example.com",
  joinedDate,
  membersWithAccess: ["user-1", "user-2"],
  // ArtistProfileFormSchemaWithoutId fields not used by PrivateInfo
  artistName: null,
  genre: null,
  members: null,
  artistDescription: null,
  city: null,
  state: null,
  country: null,
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
      <PrivateInfo {...baseProps} {...props} />
    </ToastContext.Provider>,
  );
  return { container, setToast };
}

describe("PrivateInfo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe("view mode", () => {
    it("renders the section heading", () => {
      renderWithToast();
      expect(screen.getByText("Private Info")).toBeDefined();
    });

    it("displays full name and contact email", () => {
      renderWithToast();
      expect(screen.getByText("Test User")).toBeDefined();
      expect(screen.getByText("test@example.com")).toBeDefined();
    });

    it("displays the formatted joined date", () => {
      renderWithToast();
      expect(screen.getByText(formattedDate)).toBeDefined();
    });

    it("renders a row for each member with access", () => {
      renderWithToast();
      // MembersWithAccess renders one div per member
      const memberRows = screen.getAllByText("Me");
      expect(memberRows).toHaveLength(2);
    });

    it("shows an Edit link pointing to /profile/artist/edit/private", () => {
      const { container } = renderWithToast();
      const link = container.querySelector('a[href="/profile/artist/edit/private"]');
      expect(link).not.toBeNull();
    });

    it("does not render a Save button in view mode", () => {
      renderWithToast();
      expect(screen.queryByRole("button", { name: /save/i })).toBeNull();
    });
  });

  describe("edit mode", () => {
    it("renders text inputs for fullName and contactEmail", () => {
      renderWithToast({ mode: "Edit" });
      expect(screen.getByPlaceholderText("Full Name")).toBeDefined();
      expect(screen.getByPlaceholderText("Contact Email")).toBeDefined();
    });

    it("pre-fills inputs with current values", () => {
      renderWithToast({ mode: "Edit" });
      expect(screen.getByDisplayValue("Test User")).toBeDefined();
      expect(screen.getByDisplayValue("test@example.com")).toBeDefined();
    });

    it("keeps joined date as read-only text", () => {
      renderWithToast({ mode: "Edit" });
      expect(screen.getByText(formattedDate)).toBeDefined();
    });

    it("shows the Save button and no Edit link", () => {
      const { container } = renderWithToast({ mode: "Edit" });
      expect(screen.getByRole("button", { name: "Save" })).toBeDefined();
      expect(container.querySelector('a[href="/profile/artist/edit/private"]')).toBeNull();
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
        json: async () => ({ error: "Save failed" }),
      });
      const setToast = vi.fn();
      const { container } = renderWithToast({ mode: "Edit" }, setToast);

      fireEvent.submit(container.querySelector("form")!);

      await waitFor(() => {
        expect(setToast).toHaveBeenCalledWith({
          message: "Save failed",
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
