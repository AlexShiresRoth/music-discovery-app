import StatusSetting from "@/components/status-setting";
import { ToastContext } from "@/context/toast";
import { PROFILE_STATUS_FILTERS } from "@/constants";
import type { Profile } from "@/lib/db/types";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh, push: vi.fn() }),
}));

function makeProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: "profile-1",
    profileName: "Test Band",
    openToCollaboration: false,
    openToGigs: false,
    needActForShow: false,
    statusMessage: "",
    ...overrides,
  } as Profile;
}

function renderStatus(profile: Profile = makeProfile(), setToast = vi.fn()) {
  return render(
    <ToastContext.Provider value={{ toast: null, setToast }}>
      <StatusSetting profile={profile} />
    </ToastContext.Provider>,
  );
}

describe("StatusSetting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("toggles a status flag and refreshes on success", async () => {
    const setToast = vi.fn();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true });

    renderStatus(makeProfile({ openToCollaboration: false }), setToast);

    fireEvent.click(screen.getAllByRole("button", { name: "Set as open" })[0]!);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/profile/edit", {
        method: "POST",
        body: JSON.stringify({ openToCollaboration: true }),
      });
      expect(setToast).toHaveBeenCalledWith({
        message: `"${PROFILE_STATUS_FILTERS.openToCollaboration.label}" set to open`,
        type: "success",
      });
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("shows an error toast when a toggle fails", async () => {
    const setToast = vi.fn();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: false });

    renderStatus(makeProfile({ openToGigs: false }), setToast);

    fireEvent.click(screen.getAllByRole("button", { name: "Set as open" })[1]!);

    await waitFor(() => {
      expect(setToast).toHaveBeenCalledWith(
        expect.objectContaining({ type: "error" }),
      );
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("saves a status message through the edit modal", async () => {
    const setToast = vi.fn();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true });

    renderStatus(makeProfile({ statusMessage: "Old message" }), setToast);

    fireEvent.click(
      screen.getByRole("button", { name: /Set a status message/i }),
    );
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Need a bassist for Friday" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/profile/edit", {
        method: "POST",
        body: JSON.stringify({
          statusMessage: "Need a bassist for Friday",
        }),
      });
      expect(setToast).toHaveBeenCalledWith({
        message: "Status message saved",
        type: "success",
      });
      expect(mockRefresh).toHaveBeenCalled();
    });
  });
});
