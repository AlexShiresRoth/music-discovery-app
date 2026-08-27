"use client";
import { useDeviceType } from "@/stores/use-device-type";
import {
  dismissInstallPrompt,
  handleInstall,
  isInstallPromptDismissed,
  useCanShowInstallPrompt,
  useInstall,
} from "@/stores/use-install";
import { track } from "@vercel/analytics";
import { useState } from "react";

type Params = {
  isIOS: boolean;
  isStandalone: boolean;
};

function DeviceTypeGate({ isIOS, isStandalone }: Params) {
  const [isDismissed, setIsDismissed] = useState(isInstallPromptDismissed);
  if (isStandalone || isDismissed) {
    return null;
  }

  const onDismiss = () => {
    track("install_prompt_closed");
    dismissInstallPrompt();
    setIsDismissed(true);
  };

  return (
    <div className="w-full flex justify-center items-center animate-translate-in-vertical fixed top-0 left-0 z-99999 p-4">
      <div className="flex items-center bg-amber-500 gap-4 w-fit max-w-3xl border-2 border-b-4 border-b-black rounded-md">
        {isIOS && (
          <div className="flex flex-col items-center w-full">
            <p className="text-sm p-2 text-center w-full">
              To install this app on your iOS device, tap the share button
              <span role="img" aria-label="share icon">
                {" "}
                ⎋{" "}
              </span>
              and then &quot;Add to Home Screen&quot;
              <span role="img" aria-label="plus icon">
                {" "}
                ➕{" "}
              </span>
              .
            </p>
            <button
              type="button"
              className="w-full border-t p-2 text-sm font-bold hover:cursor-pointer"
              onClick={onDismiss}
            >
              Dismiss
            </button>
          </div>
        )}
        {!isIOS && (
          <div className="flex flex-col items-center w-full">
            <div className="w-full border-b p-2 flex justify-center items-center">
              <h3 className="font-bold">
                Enjoying Side0? Add it to your device for quick access
              </h3>
            </div>
            <div className="w-full grid grid-cols-2 gap-2 text-sm">
              <button type="button" onClick={onDismiss}>
                Dismiss
              </button>
              <button
                type="button"
                data-install-button
                className="hover:cursor-pointer bg-amber-500 text-black p-2 border-l font-bold"
                onClick={() => {
                  handleInstall();
                  track("install_button_clicked");
                }}
              >
                Install
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function InstallPrompt() {
  const { isIOS, isStandalone } = useDeviceType();
  const install = useInstall();
  const canShowInstallPrompt = useCanShowInstallPrompt();

  // iOS never fires beforeinstallprompt — still show manual Add to Home Screen tips.
  if (!canShowInstallPrompt) return null;
  if (!isIOS && !install) return null;

  return <DeviceTypeGate isIOS={isIOS} isStandalone={isStandalone} />;
}
