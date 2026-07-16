import { getSession } from "@/lib/auth/session";
import NavContent from "./nav-content";

export default async function Navigation() {
  const user = await getSession();

  return (
    <nav>
      <NavContent user={user} />
    </nav>
  );
}
