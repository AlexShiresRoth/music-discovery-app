"use client";

import TextInput from "@/components/text-input";
import React from "react";
import PreHeader from "./pre-header";

export default function SocialField({
  icon,
  label,
  placeholder,
  name,
  value,
  isFormPending,
  index,
}: {
  icon?: React.ReactNode;
  label: string;
  placeholder: string;
  name: string;
  value: string;
  isFormPending: boolean;
  index: number;
}) {
  return (
    <div className="flex flex-col gap-2 border-b">
      <div className="flex items-center gap-1">
        <div className="flex items-center gap-1">
          {icon && (
            <div className="flex h-6 w-6 shrink-0 items-center justify-center text-current">
              {icon}
            </div>
          )}
          <PreHeader>{label}</PreHeader>
        </div>
      </div>
      <TextInput
        name={name}
        defaultValue={value}
        isPending={isFormPending}
        placeholder={placeholder}
        isEdit
        autoFocus={index === 0}
      />
    </div>
  );
}
