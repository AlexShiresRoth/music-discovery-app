import Footer from "@/components/footer";
import { getProfile } from "@/lib/auth";
import AdvancedSettingsSections from "./sections";

export default async function AdvancedSettingsPage() {
  const profile = await getProfile();
  const hasProfile = profile !== null;

  return (
    <main className="flex flex-col gap-4 items-center @container py-18">
      <div className="flex flex-col gap-4 max-w-4xl w-full">
        <AdvancedSettingsSections hasProfile={hasProfile} />
      </div>
      <Footer />
    </main>
  );
}
