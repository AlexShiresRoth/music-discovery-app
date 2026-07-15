"use client";

import { ToastContext } from "@/context/toast";
import { useRouter } from "next/navigation";
import { useContext, useTransition } from "react";

// TODO - this is a placeholder for the actual verification process
export default function VerifyPage() {
  const router = useRouter();
  const { setToast } = useContext(ToastContext);
  const [isPending, startTransition] = useTransition();

  const handleVerify = () => {
    startTransition(async () => {
      const res = await fetch("/api/profile/verify", {
        method: "POST",
      });

      if (res.ok) {
        setToast({ message: "Profile verified", type: "success" });
        router.push("/profile");
      } else {
        setToast({ message: "Failed to verify profile", type: "error" });
      }
    });
  };
  return (
    <div className="flex flex-col items-center gap-4 justify-center h-screen">
      <h1 className="text-2xl font-bold">
        In order to upload song clips we need to verify your account.
      </h1>
      <button
        onClick={handleVerify}
        disabled={isPending}
        className="px-4 py-2 rounded-md bg-gray-700/10 border border-white/20 hover:cursor-pointer hover:bg-gray-400/20 transition-all"
      >
        {isPending ? "Verifying..." : "Verify"}
      </button>
    </div>
  );
}
