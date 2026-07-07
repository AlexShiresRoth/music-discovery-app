import { getProfile } from "@/lib/auth";
import PrivateInfo from "../../private-info";

export default async function EditPrivateInfo() {
  const profile = await getProfile();

  if (!profile) {
    return null;
  }
  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="bg-black md:w-1/2">
        <PrivateInfo {...profile} mode="Edit" />
      </div>
    </div>
  );
}
