"use client";

import clsx from "clsx";
import { useState } from "react";

export default function ToggleButton({
  isActive,
  name,
  onToggle,
  label,
}: {
  isActive: boolean;
  name: string;
  label?: string;
  onToggle: (name: string, value: boolean) => Promise<void>;
}) {
  const [active, setIsActive] = useState(isActive);
  const [isPending, setIsPending] = useState(false);

  const handleToggle = async () => {
    if (isPending) return;

    const next = !active;
    setIsActive(next);
    setIsPending(true);

    try {
      await onToggle(name, next);
    } catch {
      setIsActive(!next);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      aria-label={label ?? `Toggle ${name} visibility`}
      disabled={isPending}
      className={clsx(
        "flex relative w-1/8 md:w-full h-5.5 items-center justify-center rounded-full hover:cursor-pointer transition-all duration-300 disabled:opacity-60 disabled:cursor-wait",
        {
          "bg-amber-500/60 border border-amber-500/80": active,
          "bg-gray-500/10 border": !active,
        },
      )}
      onClick={handleToggle}
    >
      <div
        className={clsx(
          "w-4 h-4 rounded-full absolute transition-all duration-300",
          active
            ? "left-full -translate-x-full bg-white"
            : "left-0 translate-x-0 bg-gray-400/50",
        )}
      />
    </button>
  );
}
