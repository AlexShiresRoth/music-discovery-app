import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ProfileWrapper({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex flex-col w-full py-12 items-center justify-center">
      <div className="md:w-3/4 w-full flex flex-col">
        <div className="w-full flex items-end justify-between border-b border-gray-400/80 pb-4">
          <h1 className="text-5xl font-bold uppercase">{title}</h1>
          <Link
            href="/profile"
            className="flex items-center gap-2 hover:text-indigo-500 transition-all hover:cursor-pointer"
          >
            <ArrowLeft className="text-sm" />
            Back
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
