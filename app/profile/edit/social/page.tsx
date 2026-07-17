import { getProfile } from "@/lib/auth";
import SocialSection from "../../social";
import EditWrapper from "../edit-wrapper";

export default async function EditSocialLinks() {
  const profile = await getProfile();

  if (!profile) {
    return null;
  }

  return (
    <EditWrapper>
      <SocialSection {...profile} mode="Edit" />
    </EditWrapper>
  );
}
