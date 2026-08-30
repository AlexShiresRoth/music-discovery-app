import ReorderClipsModal from "@/app/profile/reorder-clips-modal";
import { ToastContext } from "@/context/toast";
import type { SongClip } from "@/lib/db/types";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

function makeClip(id: number, title: string, slot: number): SongClip {
  return {
    id,
    slot,
    title,
    db_url: null,
    full_song_url: null,
    genre: null,
    profileRefId: 1,
    createdAt: null,
    updatedAt: null,
  } as SongClip;
}

const clips = [
  makeClip(1, "Alpha", 2),
  makeClip(2, "Bravo", 0),
  makeClip(3, "Charlie", 1),
];

function renderModal(setToast = vi.fn()) {
  return render(
    <ToastContext.Provider value={{ toast: null, setToast }}>
      <ReorderClipsModal clips={clips} />
    </ToastContext.Provider>,
  );
}

function openModal() {
  fireEvent.click(screen.getByRole("button", { name: /Reorder Clips/i }));
}

function clipRow(title: string) {
  return screen.getByText(title).closest("div.flex.items-center.justify-between");
}

function moveButtons(title: string) {
  const row = clipRow(title);
  expect(row).not.toBeNull();
  return within(row as HTMLElement).getAllByRole("button");
}

function titlesInOrder() {
  return screen
    .getAllByText(/Alpha|Bravo|Charlie/)
    .map((node) => node.textContent);
}

describe("ReorderClipsModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    document.body.style.overflow = "";
  });

  it("opens the modal with clips sorted by slot", () => {
    renderModal();
    openModal();

    expect(screen.getByRole("dialog")).toBeDefined();
    expect(
      screen.getByRole("heading", { name: "Reorder Clips" }),
    ).toBeDefined();
    expect(titlesInOrder()).toEqual(["Bravo", "Charlie", "Alpha"]);
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("closes the modal and restores body scroll on Cancel", () => {
    document.body.style.overflow = "auto";
    renderModal();
    openModal();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.body.style.overflow).toBe("auto");
  });

  it("moves a clip down", () => {
    renderModal();
    openModal();

    // Bravo is first — only a down button
    fireEvent.click(moveButtons("Bravo")[0]);

    expect(titlesInOrder()).toEqual(["Charlie", "Bravo", "Alpha"]);
  });

  it("moves a clip up", () => {
    renderModal();
    openModal();

    // Charlie is middle — up then down
    fireEvent.click(moveButtons("Charlie")[0]);

    expect(titlesInOrder()).toEqual(["Charlie", "Bravo", "Alpha"]);
  });

  it("does not show an up control on the first clip", () => {
    renderModal();
    openModal();

    expect(moveButtons("Bravo")).toHaveLength(1);
  });

  it("does not show a down control on the last clip", () => {
    renderModal();
    openModal();

    expect(moveButtons("Alpha")).toHaveLength(1);
  });

  it("truncates long titles", () => {
    render(
      <ToastContext.Provider value={{ toast: null, setToast: vi.fn() }}>
        <ReorderClipsModal
          clips={[makeClip(9, "This title is definitely long", 0)]}
        />
      </ToastContext.Provider>,
    );
    openModal();

    expect(screen.getByText("This title is d...")).toBeDefined();
  });

  it("saves the reordered clips and closes on success", async () => {
    const setToast = vi.fn();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ message: "Clips reordered successfully" }),
    });

    renderModal(setToast);
    openModal();
    fireEvent.click(moveButtons("Bravo")[0]);
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    const [, options] = (global.fetch as ReturnType<typeof vi.fn>).mock
      .calls[0];
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body).clips.map((c: SongClip) => c.id)).toEqual([
      3, 2, 1,
    ]);

    await waitFor(() => {
      expect(setToast).toHaveBeenCalledWith({
        message: "Clips reordered successfully",
        type: "success",
      });
      expect(mockRefresh).toHaveBeenCalled();
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  it("shows an error toast when save fails", async () => {
    const setToast = vi.fn();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
    });

    renderModal(setToast);
    openModal();
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(setToast).toHaveBeenCalledWith({
        message: "Failed to reorder clips",
        type: "error",
      });
    });
    expect(screen.getByRole("dialog")).toBeDefined();
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it("resets order from props when reopening the modal", () => {
    renderModal();
    openModal();
    fireEvent.click(moveButtons("Bravo")[0]);
    expect(titlesInOrder()).toEqual(["Charlie", "Bravo", "Alpha"]);

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    openModal();

    expect(titlesInOrder()).toEqual(["Bravo", "Charlie", "Alpha"]);
  });
});
