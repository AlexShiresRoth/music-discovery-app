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
        "relative bg-black border-2 p-4 rounded-md rounded-t-none w-fit flex flex-col",
        {
          "border-green-500/20 text-green-500/80": type === "success",
          "border-red-500/20 text-red-500/80": type === "error",
          "border-blue-500/20 text-blue-500/80": type === "info",
          "border-yellow-500/20 text-yellow-500/80": type === "warning",
        },
      )}
    >
      <div
        className={clsx("absolute top-0 left-0 h-1 w-full flex items-center", {
          "bg-green-500/30": type === "success",
          "bg-red-500/30": type === "error",
          "bg-blue-500/30": type === "info",
          "bg-yellow-500/30": type === "warning",
        })}
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
      {children}
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
          "translate-y-0 bottom-0": isVisible,
          "translate-y-full bottom-0": !isVisible,
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
