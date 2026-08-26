import BackButton from "@/components/breadcrumbs";
import { getProfileVerificationStatus } from "@/lib/profile/verification";
import { redirect } from "next/navigation";
import Verification from "./verification";

export default async function VerifyPage() {
  const verificationRequest = await getProfileVerificationStatus();

  if (verificationRequest === "open" || verificationRequest === "resolved") {
    return redirect("/profile");
  }

  return (
    <main className="flex flex-col items-center gap-4 justify-center w-full">
      <div className="self-end">
        <BackButton />
      </div>
      <Verification />
    </main>
  );
}
