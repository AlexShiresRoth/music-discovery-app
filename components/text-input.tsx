import { ComponentPropsWithoutRef } from "react";

type Input = ComponentPropsWithoutRef<"input">;

export default function TextInput({
  label,
  isPending,
  name,
  isEdit,
  ...props
}: Input & { label?: string; isPending: boolean; isEdit?: boolean }) {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label htmlFor={name} className="ml-4 p-2 text-sm font-semibold">
          {label}
        </label>
      )}
      {isEdit ? (
        <div className="flex items-center gap-1 w-full">
          <input
            {...props}
            name={name}
            disabled={isPending}
            className="py-1 border-0 focus:outline-0 w-full"
          />
        </div>
      ) : (
        <input
          {...props}
          name={name}
          disabled={isPending}
          type="text"
          className="border rounded-md p-4 disabled:opacity-50 focus:outline-none transition-all "
        />
      )}
    </div>
  );
}
