import { getSession } from "@/lib/auth";
import Link from "next/link";

export default async function Navigation() {
  const session = await getSession();

  if (!session) {
    return (
      <nav>
        <Link href="/login">Login</Link>
      </nav>
    );
  }

  return (
    <nav>
      <Link href="/">Home</Link>
      <Link href="/profile">Profile</Link>
      <Link href="/logout">Logout</Link>
    </nav>
  );
}
