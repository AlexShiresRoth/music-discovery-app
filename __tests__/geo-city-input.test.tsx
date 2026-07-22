import GeoCityInput from "@/app/profile/geo-city-input";
import { act, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockOn, mockSetValue, MockGeocoderAutocomplete, listeners } =
  vi.hoisted(() => {
    const listeners: Record<string, Array<(payload?: unknown) => void>> = {};
    const mockOn = vi.fn((event: string, cb: (payload?: unknown) => void) => {
      listeners[event] = listeners[event] ?? [];
      listeners[event].push(cb);
    });
    const mockSetValue = vi.fn();

    const MockGeocoderAutocomplete = vi.fn(function MockGeocoderAutocomplete(
      this: { on: typeof mockOn; setValue: typeof mockSetValue },
      container: HTMLElement,
    ) {
      const input = document.createElement("input");
      input.setAttribute("data-testid", "geoapify-input");
      container.appendChild(input);
      this.on = mockOn;
      this.setValue = mockSetValue;
    });

    return { mockOn, mockSetValue, MockGeocoderAutocomplete, listeners };
  });

vi.mock("@geoapify/geocoder-autocomplete", () => ({
  GeocoderAutocomplete: MockGeocoderAutocomplete,
}));

const defaultLocation = {
  formattedLocation: "Austin, TX, USA",
  lat: 30.27,
  lon: -97.74,
};

function emit(event: string, payload?: unknown) {
  for (const cb of listeners[event] ?? []) {
    cb(payload);
  }
}

describe("GeoCityInput", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    for (const key of Object.keys(listeners)) {
      delete listeners[key];
    }
    process.env.NEXT_PUBLIC_GEOAPIFY_KEY = "test-geo-key";
  });

  it("creates a GeocoderAutocomplete instance and prefills the default value", () => {
    render(
      <GeoCityInput
        isPending={false}
        name="location"
        placeholder="Location"
        defaultValue={defaultLocation}
      />,
    );

    expect(MockGeocoderAutocomplete).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      "test-geo-key",
      expect.objectContaining({
        lang: "en",
        limit: 5,
      }),
    );
    expect(mockSetValue).toHaveBeenCalledWith("Austin, TX, USA");
    expect(
      screen.getByDisplayValue(JSON.stringify(defaultLocation)),
    ).toBeDefined();
  });

  it("writes the selected place into the hidden location field", async () => {
    render(
      <GeoCityInput
        isPending={false}
        name="location"
        placeholder="Location"
        defaultValue={null}
      />,
    );

    await act(async () => {
      emit("select", {
        properties: {
          formatted: "Brooklyn, NY, USA",
          lat: 40.68,
          lon: -73.94,
        },
      });
    });

    await waitFor(() => {
      expect(
        screen.getByDisplayValue(
          JSON.stringify({
            formattedLocation: "Brooklyn, NY, USA",
            lat: 40.68,
            lon: -73.94,
          }),
        ),
      ).toBeDefined();
    });
  });

  it("clears the hidden field when the autocomplete is cleared", async () => {
    render(
      <GeoCityInput
        isPending={false}
        name="location"
        placeholder="Location"
        defaultValue={defaultLocation}
      />,
    );

    await act(async () => {
      emit("clear");
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue("null")).toBeDefined();
    });
  });

  it("shows a loading indicator while a geocoder request is in flight", async () => {
    const { container } = render(
      <GeoCityInput
        isPending={false}
        name="location"
        placeholder="Location"
        defaultValue={null}
      />,
    );

    expect(container.querySelector(".animate-spin")).toBeNull();

    await act(async () => {
      emit("request_start");
    });
    expect(container.querySelector(".animate-spin")).not.toBeNull();

    await act(async () => {
      emit("request_end");
    });
    expect(container.querySelector(".animate-spin")).toBeNull();
  });

  it("clears the mount node on unmount so remounts do not stack instances", () => {
    const { unmount } = render(
      <GeoCityInput
        isPending={false}
        name="location"
        placeholder="Location"
        defaultValue={null}
      />,
    );

    const mountNode = screen.getByTestId("geoapify-input").parentElement!;
    expect(mountNode.children).toHaveLength(1);

    unmount();
    expect(mountNode.children).toHaveLength(0);
  });
});
