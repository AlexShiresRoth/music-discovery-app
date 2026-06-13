import clsx from "clsx";
import { useEffect } from "react";

type Props = {
  message: string;
  type: "success" | "error" | "info" | "warning";
  duration?: 3000 | 5000;
  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;
};

export default function Toast({
  message,
  type,
  duration = 3000,
  isVisible,
  setIsVisible,
}: Props) {
  useEffect(() => {
    if (isVisible) {
      setTimeout(() => {
        setIsVisible(false);
      }, duration);
    }
  }, [duration, setIsVisible, isVisible]);

  return (
    <div
      className={clsx(
        "fixed left-1/2 -translate-x-1/2 mx-auto py-4 transition-all duration-300",
        {
          "translate-y-0 bottom-0": isVisible,
          "translate-y-full bottom-0": !isVisible,
        },
      )}
    >
      {type === "success" && (
        <div className="relative bg-black border-2 border-green-500/20 text-green-500/80 p-4 rounded-md rounded-t-none w-fit flex flex-col">
          <div className="absolute top-0 left-0 h-1 w-full bg-green-500/30 flex items-center">
            <span
              className={clsx("bg-green-500/80 h-1", {
                "progress-3 w-full": duration === 3000 && isVisible,
                "progress-5 w-full": duration === 5000 && isVisible,
              })}
            />
          </div>
          {message}
        </div>
      )}
      {type === "error" && (
        <div className="bg-black border border-red-500 text-red-500 p-4 rounded-md">
          {message}
        </div>
      )}
      {type === "info" && (
        <div className="bg-black border border-blue-500 text-blue-500 p-4 rounded-md">
          {message}
        </div>
      )}
      {type === "warning" && (
        <div className="bg-black border border-yellow-500 text-yellow-500 p-4 rounded-md">
          {message}
        </div>
      )}
    </div>
  );
}
