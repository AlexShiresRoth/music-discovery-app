"use client";

import { ArrowLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";

// TODO Idk if we should do this or just use a back button
export default function BackButton() {
  const router = useRouter();
  return (
    <div>
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center text-sm text-gray-500 hover:underline hover:cursor-pointer"
      >
        <ArrowLeftIcon className="w-4 h-4 mr-2" />
        Back
      </button>
    </div>
  );
}
