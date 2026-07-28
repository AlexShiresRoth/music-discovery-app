import clsx from "clsx";
import { Eye, EyeClosed } from "lucide-react";
import { ComponentPropsWithoutRef } from "react";

type Input = ComponentPropsWithoutRef<"input">;

export default function TextInput({
  label,
  isPending,
  name,
  isEdit,
  type = "text",
  togglePasswordVisibility,
  ...props
}: Input & {
  label?: string;
  isPending: boolean;
  isEdit?: boolean;
  togglePasswordVisibility?: () => void;
}) {
  return (
    <div
      className={clsx(
        "flex flex-col gap-2 w-full",
        props.hidden && "h-0 w-0 hidden",
      )}
    >
      {label && (
        <label htmlFor={name} className="ml-2 text-sm font-semibold">
          {label}
        </label>
      )}
      {isEdit ? (
        <div className="flex items-center gap-1 w-full">
          <input
            {...props}
            type={type}
            name={name}
            disabled={isPending}
            className="py-1 border-0 focus:outline-0 w-full"
          />
        </div>
      ) : !togglePasswordVisibility ? (
        <input
          {...props}
          type={type}
          name={name}
          disabled={isPending}
          className="border rounded-md p-4 disabled:opacity-50 focus:outline-none transition-all "
        />
      ) : (
        <div className="flex items-center gap-1 w-full border rounded-md p-4 disabled:opacity-50 focus:outline-none transition-all">
          <input
            {...props}
            type={type}
            name={name}
            disabled={isPending}
            className="w-full disabled:opacity-50 focus:outline-none"
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="hover:cursor-pointer"
          >
            {type === "password" ? <Eye size={16} /> : <EyeClosed size={16} />}
          </button>
        </div>
      )}
    </div>
  );
}
