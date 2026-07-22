import TextInput from "@/components/text-input";
import { GeocoderAutocomplete } from "@geoapify/geocoder-autocomplete";
import { useEffect, useRef } from "react";

type GeoCityInputProps = {
  isPending: boolean;
  name: string;
  defaultValue: string;
  placeholder: string;
};

export default function GeoCityInput({
  isPending,
  name,
  defaultValue,
  placeholder,
}: GeoCityInputProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const autoComplete = useRef<GeocoderAutocomplete | null>(null);

  useEffect(() => {
    autoComplete.current = new GeocoderAutocomplete(
      containerRef.current as HTMLElement,
      process.env.NEXT_PUBLIC_GEOAPIFY_KEY as string,
      {
        placeholder: "Enter your location",
        lang: "en",
        limit: 5,
      },
    );
  }, [defaultValue, name, placeholder]);

  useEffect(() => {
    if (autoComplete.current) {
      autoComplete.current.on("select", (event) => {
        console.log(event);
      });
    }
  }, [placeholder]);

  return (
    <div ref={containerRef}>
      <TextInput
        isEdit
        isPending={isPending}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
      />
    </div>
  );
}
