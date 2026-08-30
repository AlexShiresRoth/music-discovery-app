"use client";

import BackButton from "@/components/breadcrumbs";
import Footer from "@/components/footer";
import { useEffect } from "react";
import { createPortal } from "react-dom";

export function SettingsPage({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-col gap-4 items-center @container py-18">
      <div className="flex flex-col gap-4 max-w-4xl w-full">{children}</div>
      <Footer />
    </main>
  );
}

export function SettingsPageHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between w-full border-b py-4">
      <h1 className="md:text-4xl text-2xl font-bold font-serif">{title}</h1>
      <BackButton />
    </div>
  );
}

export function SettingsSection({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex md:flex-row flex-col justify-between gap-2 border-b py-4 items-start md:items-end">
      {children}
    </div>
  );
}

export function SettingsSectionCopy({
  children,
}: {
  children: React.ReactNode;
}) {
  return <p className="text-xl">{children}</p>;
}

export function SettingsModal({
  title,
  children,
  actions,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  actions: React.ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);

  return createPortal(
    <div
      className="fixed z-99 inset-0 flex flex-col items-center justify-center bg-black/20 w-full h-full animate-fade-in"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
        className="bg-background border-2 border-b-4 p-4 flex flex-col gap-4 max-w-2xl w-11/12"
        onClick={(event) => event.stopPropagation()}
      >
        <h1
          id="settings-modal-title"
          className="md:text-4xl text-2xl font-bold font-serif"
        >
          {title}
        </h1>
        {children}
        <div className="flex gap-2 flex-wrap">{actions}</div>
      </div>
    </div>,
    document.body,
  );
}
