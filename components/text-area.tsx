import { ComponentPropsWithoutRef } from "react";

export default function TextArea({
  label,
  isPending,
  name,
  ...props
}: ComponentPropsWithoutRef<"textarea"> & {
  label?: string;
  isPending: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <div className="flex relative">
          <label htmlFor={name} className="ml-2 text-sm font-semibold">
            {label}
          </label>
        </div>
      )}
      <textarea
        {...props}
        name={name}
        disabled={isPending}
        className="border rounded-md p-4 indent-1 disabled:opacity-50 focus:outline-none transition-all "
      />
    </div>
  );
}
