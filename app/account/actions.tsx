"use client";
import ActionButton from "@/components/action-button";
import {
  SettingsModal,
  SettingsSection,
  SettingsSectionCopy,
} from "@/components/settings-layout";
import TextArea from "@/components/text-area";
import { ToastContext } from "@/context/toast";
import { Loader2 } from "lucide-react";
import { useContext, useState } from "react";

type Modal = "feature" | "bug" | "delete" | null;

export default function AccountActions() {
  const { setToast } = useContext(ToastContext);
  const [modal, setModal] = useState<Modal>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const closeModal = () => {
    if (isSubmitting) return;
    setModal(null);
  };

  const submitFeedback = async (
    event: React.SyntheticEvent<HTMLFormElement>,
    type: "feature" | "bug",
  ) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const message = String(formData.get("message") || "").trim();

    if (!message) {
      setToast({ message: "Please enter a message", type: "error" });
      return;
    }

    try {
      setIsSubmitting(true);
      const endpoint =
        type === "feature" ? "/api/feature-requests" : "/api/bug-reports";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await response.json();

      if (response.ok) {
        setToast({
          message:
            data.message ||
            (type === "feature"
              ? "Feature request submitted"
              : "Bug report submitted"),
          type: "success",
        });
        setModal(null);
      } else {
        setToast({
          message: data.error || "Failed to submit",
          type: "error",
        });
      }
    } catch {
      setToast({ message: "An error occurred", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteAccount = async () => {
    try {
      setIsSubmitting(true);
      const response = await fetch("/api/account/delete", {
        method: "DELETE",
      });
      const data = await response.json();
      if (response.ok) {
        setToast({ message: data.message, type: "success" });
        return window.location.assign("/logout");
      } else {
        setToast({
          message: data.error || "Failed to delete account",
          type: "error",
        });
      }
    } catch {
      setToast({ message: "An error occurred", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SettingsSection>
        <SettingsSectionCopy>Feature requests.</SettingsSectionCopy>
        <ActionButton type="button" onClick={() => setModal("feature")}>
          Submit a request
        </ActionButton>
      </SettingsSection>
      <SettingsSection>
        <SettingsSectionCopy>Bug reports.</SettingsSectionCopy>
        <ActionButton type="button" onClick={() => setModal("bug")}>
          Submit a report
        </ActionButton>
      </SettingsSection>
      <SettingsSection>
        <SettingsSectionCopy>Delete your account.</SettingsSectionCopy>
        <ActionButton type="button" onClick={() => setModal("delete")}>
          Delete account
        </ActionButton>
      </SettingsSection>

      {modal === "feature" && (
        <SettingsModal
          title="Feature Request"
          onClose={closeModal}
          actions={
            <>
              <ActionButton
                type="button"
                onClick={closeModal}
                disabled={isSubmitting}
              >
                Cancel
              </ActionButton>
              <ActionButton
                type="submit"
                form="feature-request-form"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                  </span>
                ) : (
                  "Submit request"
                )}
              </ActionButton>
            </>
          }
        >
          <p className="text-xl">
            Tell us what you&apos;d like to see next on Side0.
          </p>
          <form
            id="feature-request-form"
            className="flex flex-col gap-4"
            onSubmit={(event) => submitFeedback(event, "feature")}
          >
            <TextArea
              name="message"
              label="Request"
              placeholder="Describe the feature..."
              rows={5}
              required
              isPending={isSubmitting}
            />
          </form>
        </SettingsModal>
      )}

      {modal === "bug" && (
        <SettingsModal
          title="Bug Report"
          onClose={closeModal}
          actions={
            <>
              <ActionButton
                type="button"
                onClick={closeModal}
                disabled={isSubmitting}
              >
                Cancel
              </ActionButton>
              <ActionButton
                type="submit"
                form="bug-report-form"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                  </span>
                ) : (
                  "Submit report"
                )}
              </ActionButton>
            </>
          }
        >
          <p className="text-xl">
            What went wrong? Include steps to reproduce if you can.
          </p>
          <form
            id="bug-report-form"
            className="flex flex-col gap-4"
            onSubmit={(event) => submitFeedback(event, "bug")}
          >
            <TextArea
              name="message"
              label="Report"
              placeholder="Describe the bug..."
              rows={5}
              required
              isPending={isSubmitting}
            />
          </form>
        </SettingsModal>
      )}

      {modal === "delete" && (
        <SettingsModal
          title="Delete Account"
          onClose={closeModal}
          actions={
            <>
              <ActionButton
                type="button"
                onClick={closeModal}
                disabled={isSubmitting}
              >
                Cancel
              </ActionButton>
              <ActionButton
                type="button"
                onClick={deleteAccount}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Deleting...
                  </span>
                ) : (
                  "Delete account"
                )}
              </ActionButton>
            </>
          }
        >
          <p className="text-xl">
            Are you sure you want to delete your account? This removes your
            profile, song clips, and sign-in access. This action is
            irreversible.
          </p>
        </SettingsModal>
      )}
    </>
  );
}
