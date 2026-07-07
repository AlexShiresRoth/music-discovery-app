import { getProfile } from "@/lib/auth";
import PublicInfo from "../../public-info";

export default async function EditPublicInfo() {
  const profile = await getProfile();

  if (!profile) {
    return null;
  }
  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="bg-black md:w-1/2">
        <PublicInfo {...profile} mode="Edit" />
      </div>
    </div>
  );
}
