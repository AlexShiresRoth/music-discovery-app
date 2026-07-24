import { getSession } from "@/lib/auth/session";
import NavContent from "./nav-content";
import Search from "./search";

export default async function Navigation() {
  const user = await getSession();

  return (
    <nav className="flex items-center justify-between w-full py-4 text-sm">
      <Search />
      <NavContent user={user} />
    </nav>
  );
}
