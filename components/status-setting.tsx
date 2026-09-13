"use client";
import ActionButton from "@/components/action-button";
import { SettingsModal } from "@/components/settings-layout";
import TextArea from "@/components/text-area";
import { ToastContext } from "@/context/toast";
import { PROFILE_STATUS_FILTERS } from "@/constants";
import { Profile } from "@/lib/db/types";
import clsx from "clsx";
import { Edit, InfoIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";

function StatusSettingItem({
  title,
  value,
  onChange,
  description,
  isLoading,
  id,
}: {
  title: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
  isLoading: boolean;
  id: number;
}) {
  return (
    <div
      className={clsx(
        "p-3 border rounded border-b-4 flex justify-between md:flex-row flex-col gap-2 items-start",
        isLoading && "opacity-50",
        value && id === 2 && "bg-emerald-500/20",
        value && id === 1 && "bg-amber-500/20",
        value && id === 0 && "bg-indigo-500/20",
      )}
    >
      <div>
        <h2 className="font-bold">{title}</h2>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <div>
        <ActionButton
          className="my-2"
          onClick={() => onChange(!value)}
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : value ? "Hide" : "Set as open"}
        </ActionButton>
      </div>
    </div>
  );
}

type StatusSettingKey =
  | "openToCollaboration"
  | "openToGigs"
  | "needActForShow"
  | "statusMessage";

const STATUSES: Record<StatusSettingKey, string> = {
  openToCollaboration: PROFILE_STATUS_FILTERS.openToCollaboration.label,
  openToGigs: PROFILE_STATUS_FILTERS.openToGigs.label,
  needActForShow: PROFILE_STATUS_FILTERS.needActForShow.label,
  statusMessage: "Status message",
};

const defaultLoadingStateMap = new Map<StatusSettingKey, boolean>([
  ["openToCollaboration", false],
  ["openToGigs", false],
  ["needActForShow", false],
  ["statusMessage", false],
]);

export default function StatusSetting({ profile }: { profile: Profile }) {
  const router = useRouter();
  const { setToast } = useContext(ToastContext);
  const [showInfo, setShowInfo] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    profile.statusMessage || "",
  );
  const [loadingSetting, setLoadingSetting] = useState<
    Map<StatusSettingKey, boolean>
  >(defaultLoadingStateMap);

  function setLoadingMap(key: StatusSettingKey, value: boolean) {
    setLoadingSetting((prev) => {
      const newMap = new Map(prev);
      newMap.set(key, value);
      return newMap;
    });
  }

  async function updateProfile(key: StatusSettingKey, value: boolean | string) {
    return await fetch(`/api/profile/edit`, {
      method: "POST",
      body: JSON.stringify({ [key]: value }),
    });
  }

  async function handleToggle(key: StatusSettingKey, value: boolean) {
    setLoadingMap(key, true);
    try {
      const res = await updateProfile(key, value);
      if (res.ok) {
        setToast({
          message: `"${STATUSES[key]}" set to ${value ? "open" : "hidden"}`,
          type: "success",
        });
      } else {
        throw new Error(
          `Failed to set "${STATUSES[key]}" to ${value ? "open" : "hidden"}`,
        );
      }
    } catch (err) {
      setToast({
        message: err as string,
        type: "error",
      });
    } finally {
      setLoadingMap(key, false);
      router.refresh();
    }
  }

  async function handleSaveStatusMessage(message: string) {
    setLoadingMap("statusMessage", true);
    try {
      const res = await updateProfile("statusMessage", message);
      if (res.ok) {
        setToast({
          message: "Status message saved",
          type: "success",
        });
      } else {
        throw new Error("Failed to save status message");
      }
    } catch (err) {
      setToast({
        message: err as string,
        type: "error",
      });
    } finally {
      setLoadingMap("statusMessage", false);
      setShowStatusModal(false);
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-bold uppercase">Find your community</h2>
          <div
            className="relative"
            onMouseEnter={() => setShowInfo(true)}
            onMouseLeave={() => setShowInfo(false)}
            aria-label="Info"
          >
            <InfoIcon className="w-4 h-4 hover:text-amber-500 transition-colors duration-300" />
            {showInfo && (
              <div className="absolute z-10 top-0 left-full flex flex-col gap-2 min-w-48 bg-background border p-4 rounded-lg shadow-lg animate-fade-in">
                <p className="text-xs text-gray-500">
                  Setting one of these options will show an indicator on your
                  profile on the feed.
                </p>
                <p className="text-xs text-gray-500">
                  People can also set a filter on the feed to find others who
                  have these settings on.
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="flex">
          <button
            className="flex items-center gap-2 hover:cursor-pointer"
            onClick={() => setShowStatusModal(true)}
          >
            <Edit className="w-4 h-4" />
            Set a status message
          </button>
          {showStatusModal && (
            <SettingsModal
              title="Status Message"
              onClose={() => setShowStatusModal(false)}
              actions={
                <>
                  <ActionButton
                    onClick={() => {
                      setStatusMessage(profile.statusMessage || "");
                      setShowStatusModal(false);
                    }}
                    disabled={loadingSetting.get("statusMessage") ?? false}
                  >
                    Cancel
                  </ActionButton>
                  <ActionButton
                    onClick={() => handleSaveStatusMessage(statusMessage)}
                    disabled={loadingSetting.get("statusMessage") ?? false}
                  >
                    {(loadingSetting.get("statusMessage") ?? false)
                      ? "Saving..."
                      : "Save"}
                  </ActionButton>
                </>
              }
            >
              <div className="flex flex-col gap-2">
                <p className="text-sm text-gray-500">
                  Let folks know exactly what you&apos;re looking for & best
                  ways to contact you.
                </p>
                <TextArea
                  onChange={(e) => setStatusMessage(e.target.value)}
                  value={statusMessage}
                  required
                  isPending={false}
                  maxLength={200}
                />
              </div>
            </SettingsModal>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatusSettingItem
          id={0}
          title="Looking to jam with others?"
          value={profile.openToCollaboration}
          description={
            profile.openToCollaboration
              ? "Yes, I'm open to collaborating with others."
              : "No, I'm not open to collaborating with others."
          }
          onChange={() =>
            handleToggle("openToCollaboration", !profile.openToCollaboration)
          }
          isLoading={loadingSetting.get("openToCollaboration") ?? false}
        />
        <StatusSettingItem
          id={1}
          title="Looking for gigs?"
          value={profile.openToGigs}
          description={
            profile.openToGigs ? "Yes, get me on a show." : "No, I'm booked up."
          }
          onChange={() => handleToggle("openToGigs", !profile.openToGigs)}
          isLoading={loadingSetting.get("openToGigs") ?? false}
        />
        <StatusSettingItem
          id={2}
          title="Need another act for your show?"
          value={profile.needActForShow}
          description={
            profile.needActForShow
              ? "Yes, let's fill the bill."
              : "No, I'm set."
          }
          onChange={() =>
            handleToggle("needActForShow", !profile.needActForShow)
          }
          isLoading={loadingSetting.get("needActForShow") ?? false}
        />
      </div>
    </div>
  );
}
