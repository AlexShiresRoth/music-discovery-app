import { ComponentPropsWithoutRef } from "react";

export default function SelectInput({
  label,
  isPending,
  name,
  options,
  isEdit = false,
  ...props
}: ComponentPropsWithoutRef<"select"> & {
  label?: string;
  isPending: boolean;
  name: string;
  options: { label: string; value: string }[];
  isEdit?: boolean;
}) {
  return (
    <div className="flex flex-col">
      {label && (
        <div className="-mb-4 flex relative">
          <label htmlFor={name} className="ml-4 text-sm">
            {label}
          </label>
        </div>
      )}
      {isEdit ? (
        <div className="flex items-center gap-1 w-full">
          <select
            {...props}
            name={name}
            disabled={isPending}
            className="border-0 -ml-1 disabled:opacity-50 focus:outline-none transition-all py-1 w-full"
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <select
          {...props}
          name={name}
          disabled={isPending}
          className="border rounded-md py-4.5 disabled:opacity-50 focus:outline-none transition-all "
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
