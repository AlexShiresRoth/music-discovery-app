import { SettingsPage } from "@/components/settings-layout";
import { getProfile } from "@/lib/auth";
import ProfileSettingsSections from "./sections";

export default async function ProfileSettingsPage() {
  const profile = await getProfile();
  const hasProfile = profile !== null;
  const isPublic = !!profile?.public;

  return (
    <SettingsPage>
      <ProfileSettingsSections hasProfile={hasProfile} isPublic={isPublic} />
    </SettingsPage>
  );
}
