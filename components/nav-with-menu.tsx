"use client";

import clsx from "clsx";
import { usePathname } from "next/navigation";
import { useState } from "react";

type Props = {
  children: React.ReactNode;
};

function MenuButton({ showMenu }: { showMenu: boolean }) {
  return (
    <button
      type="button"
      className={clsx(
        "flex h-10 w-10 flex-col gap-1 items-end justify-center rounded-full transition-opacity duration-200 hover:cursor-pointer",
      )}
    >
      <span
        className={clsx(
          "block h-0.5 bg-black transition-all duration-200",
          showMenu ? "w-4" : "w-6",
        )}
      />
      <span
        className={clsx(
          "block h-0.5 bg-black transition-all duration-200",
          showMenu ? "w-6" : "w-4",
        )}
      />
    </button>
  );
}

export default function NavWithMenu({ children }: Props) {
  const pathname = usePathname();
  const [menuState, setMenuState] = useState<{
    open: boolean;
    atPath: string;
  }>({ open: false, atPath: pathname });

  const showMenu = menuState.open && menuState.atPath === pathname;

  const openMenu = () => setMenuState({ open: !showMenu, atPath: pathname });
  const closeMenu = () => setMenuState({ open: false, atPath: pathname });

  return (
    <div
      className="relative z-50 flex items-center"
      onClick={openMenu}
      onMouseEnter={openMenu}
      onMouseLeave={closeMenu}
      aria-label="Open menu"
      aria-expanded={showMenu}
      aria-controls="menu"
    >
      <div className="h-10 w-10" aria-hidden />

      <div
        className={clsx(
          "absolute top-0 right-0 flex flex-col items-center bg-background border-2 border-b-4 rounded transition-[border-color,width] duration-200",
          showMenu
            ? "border-black min-w-54 md:min-w-36"
            : "border-transparent w-10",
        )}
      >
        <div
          className={clsx(
            "flex w-full justify-end px-2 border-b transition-all duration-200",
            showMenu && "border-black",
            !showMenu && "border-transparent",
          )}
        >
          <MenuButton showMenu={showMenu} />
        </div>
        {showMenu && (
          <div id="menu" className="flex w-full flex-col" role="menu">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
