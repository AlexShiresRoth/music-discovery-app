import clsx from "clsx";
import { AlertCircle, AlertTriangle, Check, Info } from "lucide-react";
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
}: {
  children: React.ReactNode;
  type: "success" | "error" | "info" | "warning";
}) {
  return (
    <div
      className={clsx(
        "relative border-2 border-b-4 p-2 rounded w-fit flex flex-col bg-amber-500 font-bold animate-translate-in-vertical",
      )}
    >
      <div className="flex items-center gap-2">
        {type === "success" && <Check className="size-5 bg-emerald-500" />}
        {type === "error" && <AlertCircle className="size-5 bg-red-500" />}
        {type === "info" && <Info className="size-5 bg-amber-200" />}
        {type === "warning" && (
          <AlertTriangle className="size-5 bg-yellow-500" />
        )}
        <p className="whitespace-nowrap">{children}</p>
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
      {<ToastWrapper type={type}>{message}</ToastWrapper>}
    </div>
  );
}
