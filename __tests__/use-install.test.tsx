import {
  dismissInstallPrompt,
  handleInstall,
  isInstallPromptDismissed,
  resetCanShowInstallPromptForTests,
  useCanShowInstallPrompt,
  useInstall,
} from "@/stores/use-install";
import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@vercel/analytics", () => ({
  track: vi.fn(),
}));

function InstallProbe() {
  const install = useInstall();
  return <span>{install ? "ready" : "none"}</span>;
}

function CanShowProbe() {
  const canShow = useCanShowInstallPrompt();
  return <span>{canShow ? "visible" : "hidden"}</span>;
}

function createBeforeInstallEvent(
  outcome: "accepted" | "dismissed" = "accepted",
) {
  const prompt = vi.fn().mockResolvedValue(undefined);
  const userChoice = Promise.resolve({ outcome });
  const event = new Event("beforeinstallprompt", {
    cancelable: true,
  }) as Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
  };
  Object.defineProperty(event, "prompt", { value: prompt });
  Object.defineProperty(event, "userChoice", { value: userChoice });
  return { event, prompt };
}

function resetInstallState() {
  window.localStorage.removeItem("installPromptDismissed");
  window.dispatchEvent(new Event("appinstalled"));
  resetCanShowInstallPromptForTests();
}

describe("use-install store", () => {
  beforeEach(() => {
    resetInstallState();
  });

  afterEach(() => {
    resetInstallState();
    vi.useRealTimers();
  });

  it("starts with no deferred install prompt", () => {
    render(<InstallProbe />);
    expect(screen.getByText("none")).toBeDefined();
  });

  it("stores the beforeinstallprompt event for subscribers", () => {
    render(<InstallProbe />);
    const { event } = createBeforeInstallEvent();

    act(() => {
      window.dispatchEvent(event);
    });

    expect(screen.getByText("ready")).toBeDefined();
  });

  it("clears the prompt after appinstalled", () => {
    render(<InstallProbe />);
    const { event } = createBeforeInstallEvent();

    act(() => {
      window.dispatchEvent(event);
    });
    expect(screen.getByText("ready")).toBeDefined();

    act(() => {
      window.dispatchEvent(new Event("appinstalled"));
    });
    expect(screen.getByText("none")).toBeDefined();
  });

  it("dismisses the prompt and persists dismissal in localStorage", () => {
    render(<InstallProbe />);
    const { event } = createBeforeInstallEvent();

    act(() => {
      window.dispatchEvent(event);
    });
    expect(screen.getByText("ready")).toBeDefined();
    expect(isInstallPromptDismissed()).toBe(false);

    act(() => {
      dismissInstallPrompt();
    });

    expect(screen.getByText("none")).toBeDefined();
    expect(isInstallPromptDismissed()).toBe(true);
    expect(window.localStorage.getItem("installPromptDismissed")).toBe("true");
  });

  it("calls prompt() and clears state when the user accepts", async () => {
    render(<InstallProbe />);
    const { event, prompt } = createBeforeInstallEvent("accepted");

    act(() => {
      window.dispatchEvent(event);
    });

    await act(async () => {
      await handleInstall();
    });

    expect(prompt).toHaveBeenCalledTimes(1);
    expect(screen.getByText("none")).toBeDefined();
  });

  it("keeps the deferred prompt when the user dismisses the native dialog", async () => {
    render(<InstallProbe />);
    const { event, prompt } = createBeforeInstallEvent("dismissed");

    act(() => {
      window.dispatchEvent(event);
    });

    await act(async () => {
      await handleInstall();
    });

    expect(prompt).toHaveBeenCalledTimes(1);
    expect(screen.getByText("ready")).toBeDefined();
  });

  it("no-ops handleInstall when there is no deferred prompt", async () => {
    await expect(handleInstall()).resolves.toBeUndefined();
  });

  it("delays showing the install prompt for three minutes", () => {
    vi.useFakeTimers();
    render(<CanShowProbe />);

    expect(screen.getByText("hidden")).toBeDefined();

    act(() => {
      vi.advanceTimersByTime(3 * 60 * 1000 - 1);
    });
    expect(screen.getByText("hidden")).toBeDefined();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.getByText("visible")).toBeDefined();
  });

  it("keeps the delay timer across remounts", () => {
    vi.useFakeTimers();
    const { unmount } = render(<CanShowProbe />);

    act(() => {
      vi.advanceTimersByTime(2 * 60 * 1000);
    });
    unmount();

    render(<CanShowProbe />);
    expect(screen.getByText("hidden")).toBeDefined();

    act(() => {
      vi.advanceTimersByTime(60 * 1000);
    });
    expect(screen.getByText("visible")).toBeDefined();
  });
});
