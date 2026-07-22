import TextInput from "@/components/text-input";
import { Profile } from "@/lib/db/types";
import { GeocoderAutocomplete } from "@geoapify/geocoder-autocomplete";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import "./geoapify-input.css";

type GeoCityInputProps = {
  isPending: boolean;
  name: string;
  placeholder: string;
  defaultValue: Partial<Profile["location"]> | null;
};

export default function GeoCityInput({
  isPending,
  name,
  placeholder,
  defaultValue,
}: GeoCityInputProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const autoComplete = useRef<GeocoderAutocomplete | null>(null);
  const [locationState, setLocationState] = useState<Partial<
    Profile["location"]
  > | null>(defaultValue ?? null);
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
        placeholder: "Enter your location (min 3 characters)",
        lang: "en",
        limit: 5,
      },
    );
    autoComplete.current = autocomplete;

    if (defaultValue?.formattedLocation) {
      autocomplete.setValue(defaultValue.formattedLocation);
    }

    autocomplete.on("select", (event) => {
      console.log(event);
      if (event?.properties) {
        setLocationState({
          formattedLocation: event.properties.formatted,
          lat: event.properties.lat,
          lon: event.properties.lon,
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
  }, [name, placeholder, defaultValue?.formattedLocation]);

  return (
    <div className="flex flex-col gap-2 w-full items-center relative">
      {isLoading && (
        <div className="absolute top-full left-0 p-4 w-full bg-background border rounded flex items-center justify-center">
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      )}
      {/* Dedicated mount node — keep React children out of this div */}
      <div ref={containerRef} className="w-full flex" />
      <TextInput
        isEdit
        isPending={isPending}
        name={name}
        hidden
        readOnly
        value={JSON.stringify(locationState)}
      />
    </div>
  );
}
