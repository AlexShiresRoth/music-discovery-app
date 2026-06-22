"use client";
import TextInput from "@/components/text-input";
import { ToastContext } from "@/context/toast";
import clsx from "clsx";
import { Pencil, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import { artistFormFields, ArtistProfileFormSchemaWithoutId } from "../schemas";
import PreHeader from "./pre-header";
import SocialLink from "./social-link";

type Mode = "Edit" | "View";

const SOCIAL_FIELDS = [
  {
    key: "website" as const,
    fallback: "www.mywebsite.com",
  },
  {
    key: "facebook" as const,
    fallback: "www.facebook.com/myartist",
  },
  {
    key: "instagram" as const,
    fallback: "www.instagram.com/myartist",
  },
  {
    key: "tiktok" as const,
    fallback: "www.tiktok.com/myartist",
  },
  {
    key: "spotify" as const,
    fallback: "www.spotify.com/myartist",
  },
  {
    key: "appleMusic" as const,
    fallback: "www.applemusic.com/myartist",
  },
  {
    key: "soundcloud" as const,
    fallback: "www.soundcloud.com/myartist",
  },
];

export default function SocialSection({
  website = "",
  facebook = "",
  instagram = "",
  tiktok = "",
  spotify = "",
  appleMusic = "",
  soundcloud = "",
  mode = "View",
}: ArtistProfileFormSchemaWithoutId & { mode?: Mode }) {
  const isEdit = mode === "Edit";
  const fields = artistFormFields;
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
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsFormPending(true);
      const formData = new FormData(e.target as HTMLFormElement);
      const profileData = Object.fromEntries(formData.entries());

      const response = await fetch("/api/profile/artist/edit", {
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
        router.back();
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
        "flex flex-col gap-10 w-full border border-gray-400/80 rounded-md p-8",
        isEdit && "max-h-[70vh] overflow-y-auto",
      )}
    >
      <div className="flex items-center justify-between w-full">
        <h2 className="font-bold uppercase text-indigo-500">Social Links</h2>
        {!isEdit && (
          <Link
            href="/profile/artist/edit/social"
            className="flex items-center gap-1"
          >
            <Pencil size={14} /> Edit
          </Link>
        )}
        {isEdit && (
          <button
            className="flex p-1 rounded items-center gap-1 hover:cursor-pointer hover:bg-white/10 transition-all"
            onClick={() => router.back()}
            type="button"
          >
            <X size={20} />
          </button>
        )}
      </div>
      {isEdit
        ? SOCIAL_FIELDS.map(({ key }) => (
            <div
              key={key}
              className="flex flex-col gap-2 border-b border-gray-400/80 pb-4"
            >
              <PreHeader>{fields[key].label}</PreHeader>
              <TextInput
                name={fields[key].name}
                defaultValue={values[key] || ""}
                isPending={isFormPending}
                placeholder={fields[key].placeholder}
                isEdit
              />
            </div>
          ))
        : SOCIAL_FIELDS.map(({ key, fallback }) => (
            <SocialLink
              key={key}
              link={values[key]}
              isActive={values[key] ? true : false}
              platform={fields[key].label}
              fallback={fallback}
            />
          ))}
      {isEdit && (
        <button
          type="submit"
          disabled={isFormPending}
          className="self-end px-4 py-2 rounded bg-indigo-500 uppercase text-black font-bold hover:cursor-pointer hover:bg-indigo-600 transition-colors disabled:bg-indigo-500/30"
        >
          {isFormPending ? "Saving" : "Save"}
        </button>
      )}
    </div>
  );

  return isEdit ? <form onSubmit={handleSubmit}>{content}</form> : content;
}
