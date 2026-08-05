import { getSession } from "@/lib/auth/session";
import FeedFilter from "./feed-filter";
import NavContent from "./nav-content";
import NavWithMenu from "./nav-with-menu";
import Search from "./search";

export default async function Navigation() {
  const user = await getSession();

  return (
    <nav className="flex items-start md:items-center justify-between w-full py-4 text-sm">
      <div className="flex md:flex-row flex-row-reverse justify-end md:justify-start md:items-center gap-4 w-full">
        <Search />
        <FeedFilter />
      </div>
      <div className="md:block hidden">
        <NavContent user={user} />
      </div>
      <div className="md:hidden block">
        <NavWithMenu user={user} />
      </div>
    </nav>
  );
}
