import { ComponentPropsWithoutRef } from "react";

export default function TextArea(
  props: ComponentPropsWithoutRef<"textarea"> & { label: string },
) {
  return (
    <div className="flex flex-col gap-2">
      <div className="-mb-6 flex relative">
        <label htmlFor={props.name} className="ml-4 p-2 bg-black text-sm">
          {props.label}
        </label>
      </div>
      <textarea
        {...props}
        className="border border-gray-400/80 rounded-md p-4 indent-1 focus:outline-none hover:border-gray-400 transition-all "
      />
    </div>
  );
}
