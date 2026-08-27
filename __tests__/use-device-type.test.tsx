import { useDeviceType } from "@/stores/use-device-type";
import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function Probe() {
  const { isIOS, isStandalone } = useDeviceType();
  return (
    <span>
      {isIOS ? "ios" : "other"}:{isStandalone ? "standalone" : "browser"}
    </span>
  );
}

describe("useDeviceType", () => {
  const originalUserAgent = navigator.userAgent;

  beforeEach(() => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
        onchange: null,
      })),
    );
  });

  afterEach(() => {
    Object.defineProperty(navigator, "userAgent", {
      configurable: true,
      get: () => originalUserAgent,
    });
    vi.unstubAllGlobals();
  });

  it("detects a non-iOS browser that is not standalone", () => {
    Object.defineProperty(navigator, "userAgent", {
      configurable: true,
      get: () =>
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36",
    });

    render(<Probe />);
    expect(screen.getByText("other:browser")).toBeDefined();
  });

  it("detects iOS from the user agent", () => {
    Object.defineProperty(navigator, "userAgent", {
      configurable: true,
      get: () =>
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
    });

    render(<Probe />);
    expect(screen.getByText("ios:browser")).toBeDefined();
  });

  it("detects standalone display mode", () => {
    Object.defineProperty(navigator, "userAgent", {
      configurable: true,
      get: () =>
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36",
    });
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation((query: string) => ({
        matches: query.includes("display-mode: standalone"),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
        onchange: null,
      })),
    );

    render(<Probe />);
    expect(screen.getByText("other:standalone")).toBeDefined();
  });
});
