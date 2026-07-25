"use client";

import { User } from "@supabase/supabase-js";
import clsx from "clsx";
import { MenuIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type Props = {
  user: User | null;
};

export default function NavWithMenu({ user }: Props) {
  const pathname = usePathname();
  const [menuState, setMenuState] = useState<{
    open: boolean;
    atPath: string;
  }>({ open: false, atPath: pathname });

  const showMenu = menuState.open && menuState.atPath === pathname;

  const openMenu = () => setMenuState({ open: true, atPath: pathname });
  const closeMenu = () => setMenuState({ open: false, atPath: pathname });

  return (
    <>
      <button
        type="button"
        onClick={openMenu}
        aria-label="Open menu"
        aria-expanded={showMenu}
        className={clsx(
          "z-50 flex h-10 w-10 items-center justify-center rounded-full transition-opacity duration-200 hover:cursor-pointer",
          showMenu && "pointer-events-none opacity-0",
        )}
      >
        <MenuIcon className="h-6 w-6" />
      </button>

      <div
        className={clsx(
          "fixed inset-0 z-50 bg-background transition-opacity duration-200",
          showMenu ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden={!showMenu}
      >
        <button
          type="button"
          onClick={closeMenu}
          aria-label="Close menu"
          className="absolute top-4 right-2 hover:cursor-pointer h-10 w-10"
        >
          <XIcon className="h-6 w-6" />
        </button>

        <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
          <Link href="/">Listen</Link>
          {user && <Link href="/profile">Profile</Link>}
          {!user ? (
            <Link href="/login">Login</Link>
          ) : (
            // Full navigation so auth cookies clear and the nav re-renders
            // with the signed-out session (Link soft-nav can keep a stale layout).
            <a href="/logout">Logout</a>
          )}
        </div>
      </div>
    </>
  );
}
