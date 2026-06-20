import { getSession } from "@/lib/auth/session";
import Link from "next/link";

export default async function Navigation() {
  const { session } = await getSession();

  console.log("Session in Navigation:", session);
  if (!session) {
    return (
      <nav>
        <Link href="/login">Login</Link>
      </nav>
    );
  }

  return (
    <nav className="flex w-full items-center justify-center py-4 border-b border-gray-400/80">
      <div className="flex items-center gap-4 md:w-3/4 w-full">
        <Link href="/">Home</Link>
        <Link href="/profile">Profile</Link>
        <Link href="/logout">Logout</Link>
      </div>
    </nav>
  );
}
