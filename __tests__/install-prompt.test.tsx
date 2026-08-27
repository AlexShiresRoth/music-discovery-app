import InstallPrompt from "@/components/install-prompt";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockUseDeviceType,
  mockUseInstall,
  mockUseCanShowInstallPrompt,
  mockIsInstallPromptDismissed,
  mockDismissInstallPrompt,
  mockHandleInstall,
  mockTrack,
} = vi.hoisted(() => ({
  mockUseDeviceType: vi.fn(),
  mockUseInstall: vi.fn(),
  mockUseCanShowInstallPrompt: vi.fn(),
  mockIsInstallPromptDismissed: vi.fn(),
  mockDismissInstallPrompt: vi.fn(),
  mockHandleInstall: vi.fn(),
  mockTrack: vi.fn(),
}));

vi.mock("@/stores/use-device-type", () => ({
  useDeviceType: () => mockUseDeviceType(),
}));

vi.mock("@/stores/use-install", () => ({
  useInstall: () => mockUseInstall(),
  useCanShowInstallPrompt: () => mockUseCanShowInstallPrompt(),
  isInstallPromptDismissed: () => mockIsInstallPromptDismissed(),
  dismissInstallPrompt: (...args: unknown[]) =>
    mockDismissInstallPrompt(...args),
  handleInstall: (...args: unknown[]) => mockHandleInstall(...args),
}));

vi.mock("@vercel/analytics", () => ({
  track: (...args: unknown[]) => mockTrack(...args),
}));

describe("InstallPrompt", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseDeviceType.mockReturnValue({ isIOS: false, isStandalone: false });
    mockUseInstall.mockReturnValue({ prompt: vi.fn() });
    mockUseCanShowInstallPrompt.mockReturnValue(true);
    mockIsInstallPromptDismissed.mockReturnValue(false);
  });

  it("renders nothing when there is no deferred install event", () => {
    mockUseInstall.mockReturnValue(null);
    const { container } = render(<InstallPrompt />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing before the delay allows the prompt", () => {
    mockUseCanShowInstallPrompt.mockReturnValue(false);
    const { container } = render(<InstallPrompt />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when already running as a standalone app", () => {
    mockUseDeviceType.mockReturnValue({ isIOS: false, isStandalone: true });
    const { container } = render(<InstallPrompt />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when the prompt was previously dismissed", () => {
    mockIsInstallPromptDismissed.mockReturnValue(true);
    const { container } = render(<InstallPrompt />);
    expect(container.firstChild).toBeNull();
  });

  it("shows Android/desktop install actions and handles Install", () => {
    render(<InstallPrompt />);

    expect(
      screen.getByText(/Enjoying Side0\? Add it to your device/i),
    ).toBeDefined();
    expect(screen.getByRole("button", { name: "Install" })).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Install" }));

    expect(mockHandleInstall).toHaveBeenCalledTimes(1);
    expect(mockTrack).toHaveBeenCalledWith("install_button_clicked");
  });

  it("dismisses the prompt and tracks the close", () => {
    render(<InstallPrompt />);

    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));

    expect(mockDismissInstallPrompt).toHaveBeenCalledTimes(1);
    expect(mockTrack).toHaveBeenCalledWith("install_prompt_closed");
  });

  it("shows iOS install instructions instead of the install button", () => {
    mockUseDeviceType.mockReturnValue({ isIOS: true, isStandalone: false });
    render(<InstallPrompt />);

    expect(screen.getByText(/Add to Home Screen/i)).toBeDefined();
    expect(screen.queryByRole("button", { name: "Install" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Dismiss" })).toBeNull();
  });
});
