import { getSession } from "@/lib/auth/session";
import NavContent from "./nav-content";
import NavWithMenu from "./nav-with-menu";
import Search from "./search";

export default async function Navigation() {
  const user = await getSession();

  return (
    <nav className="flex items-center justify-between w-full py-4 text-sm">
      <Search />
      <div className="md:block hidden">
        <NavContent user={user} />
      </div>
      <div className="md:hidden block">
        <NavWithMenu user={user} />
      </div>
    </nav>
  );
}
