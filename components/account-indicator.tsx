import { User } from "@supabase/supabase-js";
import { Disc2 } from "lucide-react";
import Link from "next/link";

export default function AccountIndicator({ user }: { user: User | null }) {
  if (!user) {
    return null;
  }
  return (
    <Link
      href="/account"
      className="w-full flex items-center justify-end p-2 border-b gap-2 hover:bg-amber-500/20 cursor-pointer"
    >
      <Disc2 className="w-4 h-4" />
      <p className="text-sm">{user.email}</p>
    </Link>
  );
}
