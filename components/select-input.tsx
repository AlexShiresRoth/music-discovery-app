import { ComponentPropsWithoutRef } from "react";

export default function SelectInput(
  props: ComponentPropsWithoutRef<"select"> & {
    label: string;
    options: { label: string; value: string }[];
  },
) {
  return (
    <div className="flex flex-col">
      <div className="-mb-4 flex relative">
        <label htmlFor={props.name} className="ml-4 p-2 bg-black text-sm">
          {props.label}
        </label>
      </div>
      <select
        {...props}
        className="border border-gray-400/80 rounded-md p-4 indent-1 focus:outline-none hover:border-gray-400 transition-all "
      >
        {props.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
