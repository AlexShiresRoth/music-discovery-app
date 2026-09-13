import clsx from "clsx";
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
    <div className="flex flex-col gap-2 relative">
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
        className="border rounded-md p-2 indent-1 disabled:opacity-50 focus:outline-none transition-all "
      />
      {!!props.maxLength && (
        <p
          className={clsx(
            "text-xs absolute -bottom-5 right-0",
            (props.value as string)?.length === props.maxLength
              ? "text-amber-500"
              : "text-gray-500",
          )}
        >
          {(props.value as string)?.length || 0}/{props.maxLength}
        </p>
      )}
    </div>
  );
}
