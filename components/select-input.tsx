import { Pencil } from "lucide-react";
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
          <label htmlFor={name} className="ml-4 p-2 bg-black text-sm">
            {label}
          </label>
        </div>
      )}
      {isEdit ? (
        <div className="flex items-center gap-1 w-full">
          <Pencil size={14} />
          <select
            {...props}
            name={name}
            disabled={isPending}
            className="border-0 indent-1 disabled:opacity-50 focus:outline-none transition-all py-1 px-4 w-full"
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
          className="border border-gray-400/80 rounded-md p-4 indent-1 disabled:opacity-50 focus:outline-none hover:border-gray-400 transition-all "
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
