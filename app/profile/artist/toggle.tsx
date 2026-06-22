"use client";

import clsx from "clsx";
import { useState } from "react";

export default function ToggleButton({ isActive }: { isActive: boolean }) {
  const [active, setIsActive] = useState(isActive);

  const handleToggle = () => {
    setIsActive(!active);
  };

  return (
    <button
      className={clsx(
        "flex relative w-full h-5.5 items-center justify-center rounded-full hover:cursor-pointer transition-all duration-300",
        {
          "bg-indigo-500/60 border border-indigo-500/80": active,
          "bg-gray-500/10 border border-gray-500/20": !active,
        },
      )}
      onClick={handleToggle}
    >
      <div
        className={clsx(
          "w-4 h-4 bg-white rounded-full absolute transition-all duration-300",
          active ? "left-full -translate-x-full" : "left-0 translate-x-0",
        )}
      />
    </button>
  );
}
