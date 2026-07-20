"use client";
import { ToastContext } from "@/context/toast";
import AppleMusicIcon from "@/icons/apple-music";
import BandcampIcon from "@/icons/bandcamp";
import InstagramIcon from "@/icons/instagram";
import SocialSoundcloudIcon from "@/icons/soundcloud";
import SocialSpotifyIcon from "@/icons/spotify";
import TikTokIcon from "@/icons/tiktok";
import clsx from "clsx";
import { Globe, Pencil, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import { profileFormFields, ProfileFormSchemaWithoutId } from "./schemas";
import SocialField from "./social-field";
import SocialLink from "./social-link";

type Mode = "Edit" | "View";

const SOCIAL_FIELDS = [
  {
    key: "website" as const,
    fallback: "www.mywebsite.com",
    icon: Globe,
  },
  {
    key: "instagram" as const,
    fallback: "www.instagram.com/myprofile",
    icon: InstagramIcon,
  },
  {
    key: "tiktok" as const,
    fallback: "www.tiktok.com/myprofile",
    icon: TikTokIcon,
  },
  {
    key: "spotify" as const,
    fallback: "www.spotify.com/myprofile",
    icon: SocialSpotifyIcon,
  },
  {
    key: "appleMusic" as const,
    fallback: "www.applemusic.com/myprofile",
    icon: AppleMusicIcon,
  },
  {
    key: "soundcloud" as const,
    fallback: "www.soundcloud.com/myprofile",
    icon: SocialSoundcloudIcon,
  },
  {
    key: "bandcamp" as const,
    fallback: "artist-subdomain.bandcamp.com/",
    icon: BandcampIcon,
  },
];

export default function SocialSection({
  website = { url: "", show: true },
  facebook = { url: "", show: true },
  instagram = { url: "", show: true },
  tiktok = { url: "", show: true },
  spotify = { url: "", show: true },
  appleMusic = { url: "", show: true },
  soundcloud = { url: "", show: true },
  bandcamp = { url: "", show: true },
  mode = "View",
}: ProfileFormSchemaWithoutId & { mode?: Mode }) {
  const isEdit = mode === "Edit";
  const fields = profileFormFields;
  const router = useRouter();
  const { setToast } = useContext(ToastContext);
  const [isFormPending, setIsFormPending] = useState(false);

  const values = {
    website,
    facebook,
    instagram,
    tiktok,
    spotify,
    appleMusic,
    soundcloud,
    bandcamp,
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsFormPending(true);
      const formData = new FormData(e.target as HTMLFormElement);
      const profileData = Object.fromEntries(formData.entries());

      const response = await fetch("/api/profile/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });

      const { error, success } = await response.json();

      if (!response.ok) {
        setToast({
          message: error || "Failed to update profile",
          type: "error",
        });
        setIsFormPending(false);
        return;
      }

      if (success) {
        setToast({ message: "Profile updated successfully", type: "success" });
        router.refresh();
        router.push("/profile");
      }

      setIsFormPending(false);
    } catch (error) {
      setIsFormPending(false);
      setToast({ message: JSON.stringify(error), type: "error" });
      console.error(error);
    }
  };

  const content = (
    <div
      className={clsx(
        "flex flex-col gap-10 w-full border rounded-md p-8",
        isEdit && "bg-background",
      )}
    >
      <div className="flex items-center justify-between w-full">
        <h2 className="font-bold uppercase  ">Social Links</h2>
        {!isEdit && (
          <Link href="/profile/edit/social" className="flex items-center gap-1">
            <Pencil size={14} /> Edit
          </Link>
        )}
        {isEdit && (
          <button
            className="flex p-1 rounded items-center gap-1 hover:cursor-pointer hover:bg-white/10 transition-all"
            onClick={() => router.push("/profile")}
            type="button"
          >
            <X size={20} />
          </button>
        )}
      </div>
      {isEdit ? (
        <div className="relative">
          <div className="flex flex-col gap-6 h-[40vh] overflow-y-auto pb-10">
            {SOCIAL_FIELDS.map(({ key, icon }, index) => {
              const IconComponent = icon;
              return (
                <SocialField
                  key={key}
                  label={fields[key].label}
                  placeholder={fields[key].placeholder || ""}
                  name={fields[key].name}
                  value={values[key].url || ""}
                  isFormPending={isFormPending}
                  index={index}
                  icon={IconComponent && <IconComponent size={16} />}
                />
              );
            })}
          </div>
          <div className="absolute bottom-0 left-0 w-full h-5 backdrop-blur-xs bg-background/50" />
        </div>
      ) : (
        SOCIAL_FIELDS.map(({ key, fallback, icon: IconComponent }) => (
          <SocialLink
            key={key}
            link={values[key].url}
            isActive={values[key] ? true : false}
            platform={fields[key].label}
            fallback={fallback}
            name={key}
            icon={IconComponent ? <IconComponent size={16} /> : undefined}
          />
        ))
      )}
      {isEdit && (
        <button
          type="submit"
          disabled={isFormPending}
          className="self-end px-4 py-2 rounded bg-amber-500 uppercase text-black font-bold hover:cursor-pointer hover:bg-amber-600 transition-colors disabled:bg-amber-500/30"
        >
          {isFormPending ? "Saving" : "Save"}
        </button>
      )}
    </div>
  );

  return isEdit ? <form onSubmit={handleSubmit}>{content}</form> : content;
}
