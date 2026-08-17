import { SettingsPage, SettingsPageHeader } from "@/components/settings-layout";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AccountActions from "./actions";

export default async function AccountPage() {
  const user = await getSession();
  if (!user) {
    return redirect("/login");
  }
  return (
    <SettingsPage>
      <SettingsPageHeader title="Account Settings" />
      <AccountActions />
    </SettingsPage>
  );
}
