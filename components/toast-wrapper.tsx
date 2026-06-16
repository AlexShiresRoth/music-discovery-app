"use client";
import { ToastContext } from "@/context/toast";
import { useContext } from "react";
import Toast from "./toast";

export default function ToastWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { toast, setToast } = useContext(ToastContext);
  return (
    <>
      {children}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={!!toast}
          setToast={setToast}
        />
      )}
    </>
  );
}
