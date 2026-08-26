"use client";

import ActionButton from "@/components/action-button";
import { ToastContext } from "@/context/toast";
import { useRouter } from "next/navigation";
import { useContext, useTransition } from "react";

export default function Verification() {
  const router = useRouter();
  const { setToast } = useContext(ToastContext);
  const [isPending, startTransition] = useTransition();

  const handleVerify = () => {
    startTransition(async () => {
      const res = await fetch("/api/profile/verify", {
        method: "POST",
      });

      if (res.ok) {
        setToast({
          message: "Profile verification request submitted",
          type: "success",
        });
        router.push("/profile");
      } else {
        setToast({
          message: "Failed to request profile verification",
          type: "error",
        });
      }
    });
  };

  return (
    <>
      <div className="md:w-1/3 w-full flex flex-col items-center mt-24 justify-center gap-4 text-center">
        <h1 className="text-2xl md:text-4xl">
          In order to upload song clips we need to verify your account.
        </h1>
        <p className="text-gray-500">
          This will create a request to verify your account, we will try to
          review it as soon as possible.
        </p>
        <ActionButton onClick={handleVerify} disabled={isPending}>
          {isPending ? "Submitting..." : "Request Verification"}
        </ActionButton>
      </div>
    </>
  );
}
