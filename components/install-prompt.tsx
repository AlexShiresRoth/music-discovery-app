"use client";
import { useDeviceType } from "@/stores/use-device-type";
import { useInstall } from "@/stores/use-install";

type Params = {
  isIOS: boolean;
  isStandalone: boolean;
};

function DeviceTypeGate({ isIOS, isStandalone }: Params) {
  if (isStandalone) {
    return null;
  }
  return (
    <div className="w-full flex justify-center items-center py-4">
      {!isIOS && (
        <div className="flex items-center bg-amber-500 border-2 border-b-4 rounded p-2 gap-4 max-w-2xl text-sm">
          <h3>Add to Home Screen</h3>
          <button data-install-button className="border-2 rounded px-2 py-1 ">
            Install
          </button>
        </div>
      )}
      {isIOS && (
        <p>
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
      )}
    </div>
  );
}

export default function InstallPrompt() {
  const { isIOS, isStandalone } = useDeviceType();
  const install = useInstall();

  console.log("install", install, isIOS, isStandalone);
  return <DeviceTypeGate isIOS={isIOS} isStandalone={isStandalone} />;
}
