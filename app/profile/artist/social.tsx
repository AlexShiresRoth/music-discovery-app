import { ArtistProfileFormSchemaWithoutId } from "../schemas";
import SocialLink from "./social-link";

export default function SocialSection({
  website = "",
  facebook = "",
  instagram = "",
  tiktok = "",
  spotify = "",
  appleMusic = "",
  soundcloud = "",
}: ArtistProfileFormSchemaWithoutId) {
  return (
    <div className="flex flex-col gap-10 w-full border border-gray-400/80 rounded-md p-8">
      <h2 className="font-bold uppercase text-indigo-500">Social Links</h2>
      <SocialLink
        link={website}
        platform="Website"
        fallback="www.mywebsite.com"
      />
      <SocialLink
        link={facebook}
        platform="Facebook"
        fallback="www.facebook.com/myartist"
      />
      <SocialLink
        link={instagram}
        platform="Instagram"
        fallback="www.instagram.com/myartist"
      />
      <SocialLink
        link={tiktok}
        platform="TikTok"
        fallback="www.tiktok.com/myartist"
      />
      <SocialLink
        link={spotify}
        platform="Spotify"
        fallback="www.spotify.com/myartist"
      />
      <SocialLink
        link={appleMusic}
        platform="Apple Music"
        fallback="www.applemusic.com/myartist"
      />
      <SocialLink
        link={soundcloud}
        platform="SoundCloud"
        fallback="www.soundcloud.com/myartist"
      />
    </div>
  );
}
