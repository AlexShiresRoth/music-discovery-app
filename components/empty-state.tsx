import clsx from "clsx";
import type { ReactNode } from "react";

type Props = {
  message: string;
  icon?: ReactNode;
  className?: string;
};

/** Inline empty state — matches feed/profile “No X Yet.” treatment. */
export default function EmptyState({ message, icon, className }: Props) {
  return (
    <div
      className={clsx(
        "flex h-full w-full flex-col items-center justify-center gap-2",
        className,
      )}
    >
      {icon}
      <p className="text-sm">{message}</p>
    </div>
  );
}
