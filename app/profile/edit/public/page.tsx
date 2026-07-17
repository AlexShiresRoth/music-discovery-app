import { getProfile } from "@/lib/auth";
import PublicInfo from "../../public-info";
import EditWrapper from "../edit-wrapper";

export default async function EditPublicInfo() {
  const profile = await getProfile();

  if (!profile) {
    return null;
  }

  return (
    <EditWrapper>
      <PublicInfo {...profile} mode="Edit" />
    </EditWrapper>
  );
}
