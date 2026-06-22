import { createServerClient } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LogoutPage() {
  const supabase = createServerClient();

  (await supabase).auth.signOut();

  return redirect("/login");
}
