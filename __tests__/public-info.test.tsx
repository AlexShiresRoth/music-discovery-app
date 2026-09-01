import PublicInfo from "@/app/profile/public-info";
import { ToastContext } from "@/context/toast";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

vi.mock("@/components/geo-city-input", () => ({
  default: ({
    defaultValue,
  }: {
    defaultValue: {
      formattedLocation: string;
      city: string;
      country: string;
      countryCode: string;
      state: string;
      stateCode: string;
      lat: number;
      lon: number;
    } | null;
  }) => (
    <>
      <input
        name="formattedLocation"
        readOnly
        value={defaultValue?.formattedLocation ?? ""}
        data-testid="location-input"
      />
      <input name="city" readOnly value={defaultValue?.city ?? ""} />
      <input name="country" readOnly value={defaultValue?.country ?? ""} />
      <input
        name="countryCode"
        readOnly
        value={defaultValue?.countryCode ?? ""}
      />
      <input name="state" readOnly value={defaultValue?.state ?? ""} />
      <input name="stateCode" readOnly value={defaultValue?.stateCode ?? ""} />
      <input name="lat" readOnly value={String(defaultValue?.lat ?? "")} />
      <input name="lon" readOnly value={String(defaultValue?.lon ?? "")} />
    </>
  ),
}));

const social = (url = "", show = true) => ({ url, show });

const baseProps = {
  profileName: "Test Profile",
  bio: "A test bio",
  formattedLocation: "New York, NY, USA",
  city: "New York",
  country: "United States",
  countryCode: "us",
  state: "New York",
  stateCode: "NY",
  lat: 40,
  lon: -74,
  location: null,
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
  influences: ["Radiohead", "Bjork"],
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

    it("displays bio, influences, and location", () => {
      renderWithToast();
      expect(screen.queryByText("Rock")).toBeNull();
      expect(screen.getByText("A test bio")).toBeDefined();
      expect(screen.getByText("Radiohead, Bjork")).toBeDefined();
      const location = screen.getByRole("link", { name: "New York, NY" });
      expect(location).toBeDefined();
      expect(location.getAttribute("href")).toBe(
        "/location?&q=New York&lat=40&lon=-74",
      );
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
        "New York, NY, USA",
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

    it("posts flat location fields to /api/profile/edit on submit", async () => {
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
      expect(body.formattedLocation).toBe("New York, NY, USA");
      expect(body.city).toBe("New York");
      expect(body.lat).toBe("40");
      expect(body.lon).toBe("-74");
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
