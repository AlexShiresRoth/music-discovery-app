"use client";
import { User } from "@supabase/supabase-js";
import clsx from "clsx";
import { Dot } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  user: User | null;
};

export default function NavContent({ user }: Props) {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-2 py-4 text-sm">
      <Link
        href="/"
        className={clsx(
          "hover:underline underline-offset-4 decoration-black/30",
          pathname === "/" && "underline",
        )}
      >
        Artists
      </Link>
      <span>
        <Dot className="h-4 w-4" />
      </span>
      <Link
        href="/clips"
        className={clsx(
          "hover:underline underline-offset-4 decoration-black/30",
          pathname === "/clips" && "underline",
        )}
      >
        Clips
      </Link>
      <span>
        <Dot className="h-4 w-4" />
      </span>
      {user && (
        <Link
          href="/profile"
          className={clsx(
            "hover:underline underline-offset-4 decoration-black/30",
            pathname === "/profile" && "underline",
          )}
        >
          Profile
        </Link>
      )}
      {user && (
        <span>
          <Dot className="h-4 w-4" />
        </span>
      )}

      {!user ? (
        <Link
          href="/login"
          className={clsx(
            "hover:underline underline-offset-4 decoration-black/30",
            pathname === "/login" && "underline",
          )}
        >
          Login
        </Link>
      ) : (
        // Full navigation so auth cookies clear and the nav re-renders
        // with the signed-out session (Link soft-nav can keep a stale layout).
        <a
          href="/logout"
          className={clsx(
            "hover:underline underline-offset-4 decoration-black/30",
            pathname === "/logout" && "underline",
          )}
        >
          Logout
        </a>
      )}
    </div>
  );
}
