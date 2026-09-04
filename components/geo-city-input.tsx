import {
  locationFormFields,
  type FormField,
  type ProfileLocation,
} from "@/app/profile/schemas";
import TextInput from "@/components/text-input";
import { INPUT_MAX } from "@/lib/input-limits";
import { GeocoderAutocomplete } from "@geoapify/geocoder-autocomplete";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import "./geoapify-input.css";

type GeoCityInputProps = {
  isPending: boolean;
  fields?: Record<keyof ProfileLocation, FormField>;
  placeholder?: string;
  defaultValue: ProfileLocation | null;
};

export default function GeoCityInput({
  isPending,
  fields = locationFormFields,
  placeholder = "Enter your location (min 3 characters)",
  defaultValue,
}: GeoCityInputProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const autoComplete = useRef<GeocoderAutocomplete | null>(null);
  const [locationState, setLocationState] = useState<ProfileLocation | null>(
    defaultValue,
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Avoid stacking a second widget if this effect re-runs
    container.innerHTML = "";

    const autocomplete = new GeocoderAutocomplete(
      container,
      process.env.NEXT_PUBLIC_GEOAPIFY_KEY as string,
      {
        placeholder,
        lang: "en",
        limit: 5,
      },
    );
    autoComplete.current = autocomplete;

    const geocoderInput = container.querySelector("input");
    if (geocoderInput) {
      geocoderInput.maxLength = INPUT_MAX.locationQuery;
    }

    if (!!locationState?.formattedLocation) {
      autocomplete.setValue(locationState.formattedLocation);
    }

    autocomplete.on("select", (event) => {
      if (event?.properties) {
        setLocationState({
          formattedLocation: event.properties.formatted ?? "",
          city: event.properties.city ?? "",
          country: event.properties.country ?? "",
          countryCode: event.properties.country_code ?? "",
          state: event.properties.state ?? "",
          stateCode: event.properties.state_code ?? "",
          lat: event.properties.lat ?? 0,
          lon: event.properties.lon ?? 0,
        });
      } else {
        setLocationState(null);
      }
    });
    autocomplete.on("request_start", () => setIsLoading(true));
    autocomplete.on("request_end", () => setIsLoading(false));
    autocomplete.on("clear", () => setLocationState(null));

    return () => {
      autoComplete.current = null;
      // GeocoderAutocomplete has no destroy(); clear its injected DOM
      container.innerHTML = "";
    };
  }, [placeholder, defaultValue, locationState?.formattedLocation]);

  return (
    <div className="flex flex-col gap-2 w-full items-center relative">
      {isLoading && (
        <div className="absolute top-full left-0 p-4 w-full bg-background border rounded flex items-center justify-center">
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      )}
      {/* Dedicated mount node — keep React children out of this div */}
      <div ref={containerRef} className="w-full flex" />

      {(Object.keys(fields) as Array<keyof ProfileLocation>).map((key) => (
        <TextInput
          key={key}
          isPending={isPending}
          name={fields[key].name}
          hidden
          readOnly
          maxLength={fields[key].maxLength}
          value={String(locationState?.[key] ?? "")}
          className="max-h-0 hidden"
        />
      ))}
    </div>
  );
}
