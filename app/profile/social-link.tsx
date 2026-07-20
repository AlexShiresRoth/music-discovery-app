import type { ReactNode } from "react";
import PreHeader from "./pre-header";
import ToggleButton from "./toggle";

function normalizeHref(link: string) {
  if (/^https?:\/\//i.test(link)) return link;
  return `https://${link}`;
}

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
  name: string;
  icon?: ReactNode;
}) {
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
          <ToggleButton isActive={isActive} name={name} />
        </div>
      )}
    </div>
  );
}
