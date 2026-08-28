"use client";
import { useHasVisited } from "@/stores/use-has-visited";
import { User } from "@supabase/supabase-js";
import clsx from "clsx";
import { Dot } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AccountIndicator from "./account-indicator";
import NavWithMenu from "./nav-with-menu";
import NearbyButton from "./nearby-button";

type Props = {
  user: User | null;
  pathname?: string;
  hasVisited?: boolean;
};

function WidescreenNavContent({ user, pathname, hasVisited }: Props) {
  return (
    <div className="md:flex items-center gap-2 text-sm hidden">
      <NearbyButton />
      {hasVisited && (
        <span>
          <Dot className="h-4 w-4" />
        </span>
      )}
      <Link
        href="/"
        className={clsx(
          "hover:underline underline-offset-4 decoration-black/30",
          pathname === "/" && "underline",
        )}
      >
        Main
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
      <NavWithMenu>
        <AccountIndicator user={user} />
        <div className="flex w-full justify-end">
          <Link
            href="/about"
            className={clsx(
              "w-full flex items-center justify-end p-2 hover:bg-amber-500/20 border-b",
              pathname === "/about" && "bg-amber-500/20",
            )}
          >
            About
          </Link>
        </div>
        <div className="flex w-full justify-end">
          {!user ? (
            <Link
              href="/login"
              className={clsx(
                "w-full flex items-center justify-end p-2 hover:bg-amber-500/20",
                pathname === "/login" && "bg-amber-500/20",
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
                "w-full flex items-center justify-end p-2 hover:bg-amber-500/20",
                pathname === "/logout" && "bg-amber-500/20",
              )}
            >
              Logout
            </a>
          )}
        </div>
      </NavWithMenu>
    </div>
  );
}

function MobileNavContent({ user, pathname }: Props) {
  return (
    <div className="md:hidden flex flex-col gap-2">
      <NavWithMenu>
        <NearbyButton />
        <AccountIndicator user={user} />
        <div className="flex items-center gap-2 w-full border-b">
          <Link
            href="/"
            className={clsx(
              "w-full flex items-center justify-end p-2 hover:bg-amber-500/20",
              pathname === "/" && "bg-amber-500/20",
            )}
          >
            Main
          </Link>
        </div>
        <div className="flex items-center gap-2 w-full border-b">
          <Link
            href="/clips"
            className={clsx(
              "w-full flex items-center justify-end p-2 hover:bg-amber-500/20",
              pathname === "/clips" && "bg-amber-500/20",
            )}
          >
            Clips
          </Link>
        </div>
        {user && (
          <div className="flex items-center gap-2 w-full border-b">
            <Link
              href="/profile"
              className={clsx(
                "w-full flex items-center justify-end p-2 hover:bg-amber-500/20",
                pathname === "/profile" && "bg-amber-500/20",
              )}
            >
              Profile
            </Link>
          </div>
        )}
        <div className="flex w-full justify-end border-b">
          <Link
            href="/about"
            className={clsx(
              "w-full flex items-center justify-end p-2 hover:bg-amber-500/20",
              pathname === "/about" && "bg-amber-500/20",
            )}
          >
            About
          </Link>
        </div>
        <div className="flex w-full justify-end">
          {!user ? (
            <Link
              href="/login"
              className={clsx(
                "w-full flex items-center justify-end p-2 hover:bg-amber-500/20",
                pathname === "/login" && "bg-amber-500/20",
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
                "w-full flex items-center justify-end p-2 hover:bg-amber-500/20",
                pathname === "/logout" && "bg-amber-500/20",
              )}
            >
              Logout
            </a>
          )}
        </div>
      </NavWithMenu>
    </div>
  );
}

export default function NavContent({ user }: Props) {
  const pathname = usePathname();
  const hasVisited = useHasVisited();

  return (
    <div className="flex items-start gap-2 text-sm">
      <WidescreenNavContent
        user={user}
        pathname={pathname}
        hasVisited={hasVisited}
      />
      <MobileNavContent
        user={user}
        pathname={pathname}
        hasVisited={hasVisited}
      />
    </div>
  );
}
