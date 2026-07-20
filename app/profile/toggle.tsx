"use client";

import clsx from "clsx";
import { useState } from "react";

export default function ToggleButton({
  isActive,
  name,
}: {
  isActive: boolean;
  name: string;
}) {
  const [active, setIsActive] = useState(isActive);

  const submitToggle = async (name: string, value: boolean) => {
    return await fetch("/api/profile/edit", {
      method: "POST",
      body: JSON.stringify({
        name,
        value,
      }),
    });
  };

  const handleToggle = async () => {
    setIsActive(!active);
    await submitToggle(name, !active);
  };

  return (
    <button
      className={clsx(
        "flex relative w-1/8 md:w-full h-5.5 items-center justify-center rounded-full hover:cursor-pointer transition-all duration-300",
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
