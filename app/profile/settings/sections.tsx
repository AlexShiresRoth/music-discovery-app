"use client";
import ActionButton from "@/components/action-button";
import {
  SettingsModal,
  SettingsPageHeader,
  SettingsSection,
  SettingsSectionCopy,
} from "@/components/settings-layout";
import { ToastContext } from "@/context/toast";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";

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
      <SettingsPageHeader title="Profile Settings" />
      {hasProfile && (
        <SettingsSection>
          <SettingsSectionCopy>
            Toggle your profile visibility.
          </SettingsSectionCopy>
          <div>
            <ActionButton onClick={hideProfile} disabled={isProfileLoading}>
              {isProfileLoading
                ? "Loading..."
                : isPublic
                  ? "Hide Profile"
                  : "Make Profile Public"}
            </ActionButton>
          </div>
        </SettingsSection>
      )}
      <SettingsSection>
        <SettingsSectionCopy>
          Delete your profile and all your song clips.
        </SettingsSectionCopy>
        <div>
          <ActionButton onClick={() => setDeleteModal(true)}>
            Delete Profile
          </ActionButton>
        </div>
      </SettingsSection>
      {deleteModal && (
        <SettingsModal
          title="Delete Profile"
          onClose={() => !isDeleting && setDeleteModal(false)}
          actions={
            <>
              <ActionButton
                type="button"
                onClick={() => setDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancel
              </ActionButton>
              <ActionButton
                type="button"
                onClick={deleteProfile}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Deleting...
                  </span>
                ) : (
                  "Delete Profile"
                )}
              </ActionButton>
            </>
          }
        >
          <p className="text-xl">
            Are you sure you want to delete your profile? This action is
            irreversible. You will have to create a new profile and re-upload
            your song clips.
          </p>
        </SettingsModal>
      )}
    </>
  );
}
