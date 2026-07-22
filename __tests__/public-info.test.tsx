import PublicInfo from "@/app/profile/public-info";
import { ToastContext } from "@/context/toast";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

vi.mock("@/app/profile/geo-city-input", () => ({
  default: ({
    name,
    defaultValue,
  }: {
    name: string;
    defaultValue: { formattedLocation: string; lat: number; lon: number } | null;
  }) => (
    <input
      name={name}
      readOnly
      value={JSON.stringify(defaultValue)}
      data-testid="location-input"
    />
  ),
}));

const location = {
  formattedLocation: "New York, NY, USA",
  lat: 40.71,
  lon: -74.0,
};

const social = (url = "", show = true) => ({ url, show });

const baseProps = {
  profileName: "Test Profile",
  genre: "Rock",
  bio: "A test bio",
  location,
  fullName: "Test User",
  contactEmail: "test@example.com",
  website: social(),
  facebook: social(),
  instagram: social(),
  tiktok: social(),
  spotify: social(),
  appleMusic: social(),
  soundcloud: social(),
  bandcamp: social(),
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

    it("displays the profile name", () => {
      renderWithToast();
      expect(screen.getByText("Test Profile")).toBeDefined();
    });

    it("displays genre, bio, and formatted location", () => {
      renderWithToast();
      expect(screen.getByText("Rock")).toBeDefined();
      expect(screen.getByText("A test bio")).toBeDefined();
      expect(screen.getByText("New York, NY, USA")).toBeDefined();
    });

    it("shows an Edit link pointing to /profile/edit/public", () => {
      const { container } = renderWithToast();
      const link = container.querySelector('a[href="/profile/edit/public"]');
      expect(link).not.toBeNull();
    });

    it("does not render a Save button in view mode", () => {
      renderWithToast();
      expect(screen.queryByRole("button", { name: /save/i })).toBeNull();
    });
  });

  describe("edit mode", () => {
    it("renders inputs pre-filled with current values including location", () => {
      renderWithToast({ mode: "Edit" });
      expect(screen.getByDisplayValue("Test Profile")).toBeDefined();
      expect(screen.getByTestId("location-input")).toHaveProperty(
        "value",
        JSON.stringify(location),
      );
    });

    it("shows the Save button", () => {
      renderWithToast({ mode: "Edit" });
      expect(screen.getByRole("button", { name: "Save" })).toBeDefined();
    });

    it("does not show the Edit link", () => {
      const { container } = renderWithToast({ mode: "Edit" });
      expect(
        container.querySelector('a[href="/profile/edit/public"]'),
      ).toBeNull();
    });

    it("styles the Save button with amber background", () => {
      renderWithToast({ mode: "Edit" });
      expect(screen.getByRole("button", { name: "Save" }).className).toContain(
        "bg-amber-500",
      );
    });

    it("navigates to /profile when the close button is clicked", () => {
      const { container } = renderWithToast({ mode: "Edit" });
      fireEvent.click(container.querySelector('button[type="button"]')!);
      expect(mockPush).toHaveBeenCalledWith("/profile");
    });

    it("posts parsed location JSON to /api/profile/edit on submit", async () => {
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

      const body = JSON.parse(
        (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body,
      );
      expect(body.location).toEqual(location);
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
