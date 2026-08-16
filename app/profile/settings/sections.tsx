"use client";
import ActionButton from "@/components/action-button";
import BackButton from "@/components/breadcrumbs";
import { ToastContext } from "@/context/toast";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";

function Section({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-2 border-b py-4 items-end">
      {children}
    </div>
  );
}

type Props = {
  hasProfile: boolean;
  isPublic: boolean;
};
export default function ProfileSettingsSections({
  hasProfile,
  isPublic,
}: Props) {
  const router = useRouter();
  const { setToast } = useContext(ToastContext);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  const hideProfile = async () => {
    try {
      setIsProfileLoading(true);
      const response = await fetch("/api/profile/hide");
      const data = await response.json();
      if (response.ok) {
        setToast({ message: data.message, type: "success" });
        router.refresh();
      } else {
        setToast({ message: data.error, type: "error" });
      }
    } catch {
      setToast({ message: "An error occurred", type: "error" });
    } finally {
      setIsProfileLoading(false);
    }
  };

  const deleteProfile = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch("/api/profile/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (response.ok) {
        setToast({ message: data.message, type: "success" });
        router.push("/");
      } else {
        setToast({ message: data.error, type: "error" });
      }
    } catch {
      setToast({ message: "An error occurred", type: "error" });
    } finally {
      setIsDeleting(false);
    }
  };
  return (
    <>
      <Section>
        <h1 className="text-4xl font-bold font-serif">Profile Settings</h1>
        <BackButton />
      </Section>
      {hasProfile && (
        <Section>
          <p className="text-xl">Toggle your profile visibility.</p>
          <div>
            <ActionButton onClick={hideProfile} disabled={isProfileLoading}>
              {isProfileLoading
                ? "Loading..."
                : isPublic
                  ? "Hide Profile"
                  : "Make Profile Public"}
            </ActionButton>
          </div>
        </Section>
      )}
      <Section>
        <p className="text-xl">Delete your profile and all your song clips.</p>
        <div>
          <ActionButton onClick={() => setDeleteModal(true)}>
            Delete Profile
          </ActionButton>
        </div>
      </Section>
      {deleteModal && (
        <div className="fixed z-99 inset-0 flex flex-col items-center justify-center bg-black/20 w-full h-full animate-fade-in">
          <div className="bg-background border-2 border-b-4 p-4 flex flex-col gap-4 max-w-2xl w-full">
            <h1 className="text-4xl font-bold font-serif">Delete Profile</h1>
            <p className="text-xl">
              Are you sure you want to delete your profile? This action is
              irreversible. You will have to create a new profile and re-upload
              your song clips.
            </p>
            <div className="flex gap-2">
              <ActionButton onClick={() => setDeleteModal(false)}>
                Cancel
              </ActionButton>
              <ActionButton onClick={deleteProfile} disabled={isProfileLoading}>
                {isDeleting ? (
                  <span>
                    <Loader2 className="w-4 h-4 animate-spin" /> Deleting...
                  </span>
                ) : (
                  "Delete Profile"
                )}
              </ActionButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
