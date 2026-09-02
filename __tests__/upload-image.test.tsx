import UploadImage from "@/app/profile/upload-image";
import { ToastContext } from "@/context/toast";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

function renderUpload(imageUrl = "", setToast = vi.fn()) {
  return render(
    <ToastContext.Provider value={{ toast: null, setToast }}>
      <UploadImage imageUrl={imageUrl} />
    </ToastContext.Provider>,
  );
}

describe("UploadImage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    // @ts-expect-error test stub for File System Access API
    delete window.showOpenFilePicker;
  });

  it("does nothing noisy when the user cancels the file picker", async () => {
    const setToast = vi.fn();
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    window.showOpenFilePicker = vi.fn().mockRejectedValue(
      new DOMException("The user aborted a request.", "AbortError"),
    );

    renderUpload("", setToast);
    fireEvent.click(screen.getByRole("button", { name: "Upload image" }));

    await waitFor(() => {
      expect(window.showOpenFilePicker).toHaveBeenCalled();
    });

    expect(global.fetch).not.toHaveBeenCalled();
    expect(setToast).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Upload image" })).toHaveProperty(
      "disabled",
      false,
    );

    consoleError.mockRestore();
  });

  it("uploads and saves when a file is selected", async () => {
    const setToast = vi.fn();
    const file = new File(["img"], "photo.png", { type: "image/png" });
    window.showOpenFilePicker = vi.fn().mockResolvedValue([
      { getFile: vi.fn().mockResolvedValue(file) },
    ]);
    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          publicUrl: "https://cdn.example.com/photo.png",
        }),
      })
      .mockResolvedValueOnce({ ok: true });

    renderUpload("", setToast);
    fireEvent.click(screen.getByRole("button", { name: "Upload image" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/profile/upload-image",
        expect.objectContaining({ method: "POST" }),
      );
      expect(global.fetch).toHaveBeenCalledWith("/api/profile/edit", {
        method: "POST",
        body: JSON.stringify({
          imageUrl: "https://cdn.example.com/photo.png",
        }),
      });
      expect(setToast).toHaveBeenCalledWith({
        message: "Image saved to profile",
        type: "success",
      });
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("shows an error toast when upload fails after a file is chosen", async () => {
    const setToast = vi.fn();
    const file = new File(["img"], "photo.png", { type: "image/png" });
    window.showOpenFilePicker = vi.fn().mockResolvedValue([
      { getFile: vi.fn().mockResolvedValue(file) },
    ]);
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
    });

    renderUpload("", setToast);
    fireEvent.click(screen.getByRole("button", { name: "Upload image" }));

    await waitFor(() => {
      expect(setToast).toHaveBeenCalledWith({
        message: "Failed to upload image",
        type: "error",
      });
    });
    expect(screen.getByRole("button", { name: "Upload image" })).toHaveProperty(
      "disabled",
      false,
    );
  });
});
