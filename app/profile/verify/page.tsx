"use client";

import ActionButton from "@/components/action-button";
import BackButton from "@/components/breadcrumbs";
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
    <main className="flex flex-col items-center gap-4 justify-center w-full">
      <div className="self-end">
        <BackButton />
      </div>
      <div className="md:w-1/3 w-full flex flex-col items-center mt-24 justify-center gap-4 text-center">
        <h1 className="text-2xl md:text-4xl">
          In order to upload song clips we need to verify your account.
        </h1>
        <ActionButton onClick={handleVerify} disabled={isPending}>
          {isPending ? "Verifying..." : "Verify"}
        </ActionButton>
      </div>
    </main>
  );
}
