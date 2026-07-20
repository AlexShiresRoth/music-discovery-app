"use client";

import { ToastContext } from "@/context/toast";
import type { ReactNode } from "react";
import { useContext } from "react";
import { useRouter } from "next/navigation";
import PreHeader from "./pre-header";
import { ProfileFormSchemaWithoutId } from "./schemas";
import ToggleButton from "./toggle";

function normalizeHref(link: string) {
  if (/^https?:\/\//i.test(link)) return link;
  return `https://${link}`;
}

type SocialName =
  | "website"
  | "facebook"
  | "instagram"
  | "tiktok"
  | "spotify"
  | "appleMusic"
  | "soundcloud"
  | "bandcamp";

export default function SocialLink({
  link,
  platform,
  fallback,
  isActive,
  name,
  icon,
}: {
  link: string | null;
  platform: string;
  fallback: string;
  isActive: boolean;
  name: SocialName;
  icon?: ReactNode;
}) {
  const router = useRouter();
  const { setToast } = useContext(ToastContext);

  const handleToggle = async (fieldName: string, value: boolean) => {
    const data: Partial<Pick<ProfileFormSchemaWithoutId, SocialName>> = {
      [fieldName]: {
        url: link || "",
        show: value,
      },
    };

    const response = await fetch("/api/profile/edit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const { error, success } = await response.json();

    if (!response.ok) {
      setToast({
        message: error || "Failed to update visibility",
        type: "error",
      });
      throw new Error(error || "Failed to update visibility");
    }

    if (success) {
      router.refresh();
    }
  };

  return (
    <div className="flex gap-2 md:items-center md:flex-row flex-col justify-between border-b pb-4">
      <div className="flex flex-col gap-2 min-w-0">
        <div className="flex items-center gap-2">
          {icon && (
            <div className="flex h-4 w-4 shrink-0 items-center justify-center text-current">
              {icon}
            </div>
          )}
          <PreHeader>{platform}</PreHeader>
        </div>
        <div className="flex justify-start w-full min-w-0">
          {link ? (
            <a
              href={normalizeHref(link)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg text-gray-400/80 hover:underline underline-offset-4 truncate"
            >
              {link}
            </a>
          ) : (
            <p className="text-lg text-gray-400/50">{fallback}</p>
          )}
        </div>
      </div>
      {link && (
        <div className="flex flex-col items-start gap-2">
          <PreHeader>Show</PreHeader>
          <ToggleButton
            key={`${name}-${isActive}`}
            isActive={isActive}
            name={name}
            label={`Show ${platform}`}
            onToggle={handleToggle}
          />
        </div>
      )}
    </div>
  );
}
