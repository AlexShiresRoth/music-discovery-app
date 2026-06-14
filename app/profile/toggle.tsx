"use client";

import clsx from "clsx";
import { useState } from "react";

export default function ToggleButton() {
  const [isActive, setIsActive] = useState(false);

  const handleToggle = () => {
    setIsActive(!isActive);
  };

  return (
    <button
      className="flex relative w-full h-5.5 items-center justify-center bg-indigo-500/40 border border-indigo-500/80 rounded-full hover:cursor-pointer"
      onClick={handleToggle}
    >
      <div
        className={clsx(
          "w-4 h-4 bg-white rounded-full absolute transition-all duration-300",
          isActive ? "left-full -translate-x-full" : "left-0 translate-x-0",
        )}
      />
    </button>
  );
}
