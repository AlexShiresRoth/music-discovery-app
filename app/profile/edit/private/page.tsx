import { getProfile } from "@/lib/auth";
import PrivateInfo from "../../private-info";
import EditWrapper from "../edit-wrapper";

export default async function EditPrivateInfo() {
  const profile = await getProfile();

  if (!profile) {
    return null;
  }

  return (
    <EditWrapper>
      <PrivateInfo {...profile} mode="Edit" />
    </EditWrapper>
  );
}
