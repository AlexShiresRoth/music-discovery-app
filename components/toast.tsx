import clsx from "clsx";
import { useEffect } from "react";

type Props = {
  message: string;
  type: "success" | "error" | "info" | "warning";
  duration?: 3000 | 5000;
  isVisible: boolean;
  setToast: (isVisible: null) => void;
};

function ToastWrapper({
  children,
  type,
  duration,
  isVisible,
}: {
  children: React.ReactNode;
  type: "success" | "error" | "info" | "warning";
  duration: 3000 | 5000;
  isVisible: boolean;
}) {
  return (
    <div
      className={clsx(
        "relative border-2 border-b-4 p-4 rounded rounded-b-none w-fit flex flex-col bg-amber-500 border-black text-black",
      )}
    >
      {children}
      <div
        className={clsx(
          "absolute bottom-0 left-0 h-1 w-full flex items-center",
          {
            "bg-green-500/30": type === "success",
            "bg-red-500/30": type === "error",
            "bg-blue-500/30": type === "info",
            "bg-yellow-500/30": type === "warning",
          },
        )}
      >
        <span
          className={clsx("h-1", {
            "progress-3 w-full": duration === 3000 && isVisible,
            "progress-5 w-full": duration === 5000 && isVisible,
            "bg-green-500/80 text-green-500/80": type === "success",
            "bg-red-500/80 text-red-500/80": type === "error",
            "bg-blue-500/80 text-blue-500/80": type === "info",
            "bg-yellow-500/80 text-yellow-500/80": type === "warning",
          })}
        />
      </div>
    </div>
  );
}

export default function Toast({
  message,
  type,
  duration = 3000,
  isVisible,
  setToast,
}: Props) {
  useEffect(() => {
    if (isVisible) {
      setTimeout(() => {
        setToast(null);
      }, duration);
    }
  }, [duration, setToast, isVisible]);

  return (
    <div
      className={clsx(
        "fixed left-1/2 -translate-x-1/2 mx-auto py-4 transition-all duration-300 z-50",
        {
          "translate-y-0 top-0": isVisible,
          "translate-y-full top-0": !isVisible,
        },
      )}
    >
      {
        <ToastWrapper type={type} duration={duration} isVisible={isVisible}>
          {message}
        </ToastWrapper>
      }
    </div>
  );
}
