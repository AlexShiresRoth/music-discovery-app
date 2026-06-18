import { getArtistProfile } from "@/lib/auth";
import PublicInfo from "../../public-info";

export default async function EditArtistProfile() {
  const artistProfile = await getArtistProfile();

  if (!artistProfile) {
    return null;
  }
  return <PublicInfo {...artistProfile} />;
}
