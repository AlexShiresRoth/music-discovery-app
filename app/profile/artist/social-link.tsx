import PreHeader from "./pre-header";
import ToggleButton from "./toggle";

export default function SocialLink({
  link,
  platform,
  fallback,
  isActive,
}: {
  link: string | null;
  platform: string;
  fallback: string;
  isActive: boolean;
}) {
  return (
    <div className="flex gap-2 items-center justify-between border-b border-gray-400/80 pb-4">
      <div className="flex flex-col gap-2">
        <PreHeader>{platform}</PreHeader>
        <div className="flex justify-start w-full">
          {link ? (
            <p className="text-lg text-gray-400/80">{link}</p>
          ) : (
            <p className="text-lg text-gray-400/50">{fallback}</p>
          )}
        </div>
      </div>
      {link && (
        <div className="flex flex-col gap-2">
          <PreHeader>Show</PreHeader>
          <ToggleButton isActive={isActive} />
        </div>
      )}
    </div>
  );
}
