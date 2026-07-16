import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ProfileLayout({
  children,
  edit,
}: {
  children: React.ReactNode;
  edit: React.ReactNode;
}) {
  const user = await getSession();

  if (!user) {
    return redirect("/login");
  }
  return (
    <>
      {children}
      {edit}
    </>
  );
}
