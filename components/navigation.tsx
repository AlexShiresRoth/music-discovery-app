import { getSession } from "@/lib/auth/session";
import Link from "next/link";

export default async function Navigation() {
  const user = await getSession();

  if (!user) {
    return (
      <nav>
        <Link href="/login">Login</Link>
      </nav>
    );
  }

  return (
    <nav className="flex h-screen border-r">
      <div className="flex flex-col gap-4 md:w-3/4 p-8">
        <Link href="/">Discover</Link>
        <Link href="/profile">Profile</Link>
        <Link href="/logout">Logout</Link>
      </div>
    </nav>
  );
}
