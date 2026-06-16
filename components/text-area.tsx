import { ComponentPropsWithoutRef } from "react";

export default function TextArea({
  label,
  isPending,
  name,
  ...props
}: ComponentPropsWithoutRef<"textarea"> & {
  label: string;
  isPending: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="-mb-6 flex relative">
        <label htmlFor={name} className="ml-4 p-2 bg-black text-sm">
          {label}
        </label>
      </div>
      <textarea
        {...props}
        name={name}
        disabled={isPending}
        className="border border-gray-400/80 rounded-md p-4 indent-1 disabled:opacity-50 focus:outline-none hover:border-gray-400 transition-all "
      />
    </div>
  );
}
