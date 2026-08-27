import { getDeviceSnapshot } from "@/lib/device-snapshot";
import { describe, expect, it } from "vitest";

describe("getDeviceSnapshot", () => {
  it("returns a stable reference for useSyncExternalStore", () => {
    expect(getDeviceSnapshot()).toBe(getDeviceSnapshot());
    expect(getDeviceSnapshot()).toEqual({
      isIOS: false,
      isStandalone: false,
    });
  });
});
