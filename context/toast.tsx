"use client";

import { createContext, useState } from "react";

type ToastContextType = {
  toast: { message: string; type: "success" | "error" } | null;
  setToast: (
    toast: { message: string; type: "success" | "error" } | null,
  ) => void;
};

export const ToastContext = createContext<ToastContextType>({
  toast: null,
  setToast: () => {},
});

export default function ToastProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  return (
    <ToastContext.Provider value={{ toast, setToast }}>
      {children}
    </ToastContext.Provider>
  );
}
