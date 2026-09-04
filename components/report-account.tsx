"use client";

import { ToastContext } from "@/context/toast";
import { INPUT_MAX } from "@/lib/input-limits";
import { AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useContext, useMemo, useState } from "react";
import ActionButton from "./action-button";
import SelectInput from "./select-input";
import { SettingsModal } from "./settings-layout";
import TextArea from "./text-area";

type Props = {
  isAuthenticated: boolean;
  profileId: number;
};

export default function ReportAccount({ isAuthenticated, profileId }: Props) {
  const { setToast } = useContext(ToastContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [reportReason, setReportReason] = useState<string>(
    "copyright-infringement",
  );
  const [description, setDescription] = useState("");
  const reasons = useMemo(() => {
    if (isAuthenticated) {
      return [
        { label: "Spam", value: "spam" },
        { label: "Hate Speech", value: "hate-speech" },
        { label: "Harassment", value: "harassment" },
        { label: "Innapropriate Image", value: "inappropriate-image" },
        { label: "Copyright Infringement", value: "copyright-infringement" },
        { label: "Other", value: "other" },
      ];
    }
    return [
      { label: "Copyright Infringement", value: "copyright-infringement" },
    ];
  }, [isAuthenticated]);

  const handleSubmit = async (
    event: React.SyntheticEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();

    setIsSubmitting(true);
    try {
      if (!description || !reportReason) {
        setToast({
          message: "Please provide a report reason and description",
          type: "error",
        });
        setIsSubmitting(false);
        return;
      }

      const response = await fetch("/api/account-report", {
        method: "POST",
        body: JSON.stringify({
          profileId,
          reportReason: reportReason || reasons[0].value,
          description,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to report account");
      }

      const data = await response.json();

      setShowModal(false);
      setToast({ message: data.message, type: "success" });
      setReportReason(reasons[0].value);
      setDescription("");
    } catch {
      setToast({ message: "Failed to report account", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="hover:cursor-pointer hover:text-gray-900 transition-colors relative flex items-center gap-2"
      >
        <AlertCircle className="w-3 h-3 text-gray-500" />
        <div className="text-gray-500 text-xs">
          <p>Report Account</p>
        </div>
      </button>
      {showModal && (
        <SettingsModal
          title="Report Account"
          onClose={() => setShowModal(false)}
          actions={
            <>
              <ActionButton
                type="button"
                onClick={() => setShowModal(false)}
                disabled={isSubmitting}
              >
                Cancel
              </ActionButton>
              <ActionButton
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                  </span>
                ) : (
                  "Submit"
                )}
              </ActionButton>
            </>
          }
        >
          <Link
            href="/community-guidelines"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors underline underline-offset-4"
          >
            View Community Guidelines
          </Link>
          <p>Why are you reporting this account?</p>
          <div className="flex flex-col gap-2">
            <SelectInput
              label="Report Reason"
              isPending={false}
              name="reportReason"
              options={reasons}
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            />
            <TextArea
              label="Description"
              isPending={false}
              name="description"
              placeholder="Description"
              value={description}
              maxLength={INPUT_MAX.reportDescription}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </SettingsModal>
      )}
    </>
  );
}
