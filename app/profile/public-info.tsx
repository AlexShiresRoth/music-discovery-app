"use client";
import ActionButton from "@/components/action-button";
import MultiSelectInput from "@/components/multi-select-input";
import TextArea from "@/components/text-area";
import TextInput from "@/components/text-input";
import { ToastContext } from "@/context/toast";
import clsx from "clsx";
import { Pencil, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode, useContext, useState } from "react";
import GeoCityInput from "../../components/geo-city-input";
import ProfileLocationDisplay from "../../components/profile-location-display";
import PreHeader from "./pre-header";
import {
  locationFormFields,
  profileFormFields,
  ProfileFormSchemaWithoutId,
} from "./schemas";

type Mode = "Edit" | "View";

type ViewOrEditDataProps = {
  title: string;
  children: ReactNode;
};

type ViewOrEditFormData = {
  mode: Mode;
  children: ReactNode;
};

function ViewOrEditData({ title, children }: ViewOrEditDataProps) {
  return (
    <div className="flex flex-col w-full">
      <PreHeader>{title}</PreHeader>
      {children}
    </div>
  );
}

function ViewOrEditForm({
  children,
  mode,
  handleSubmit,
}: ViewOrEditFormData & {
  handleSubmit: (e: React.SubmitEvent<HTMLFormElement>) => void;
}) {
  return mode === "Edit" ? (
    <form onSubmit={handleSubmit}>{children}</form>
  ) : (
    <>{children}</>
  );
}

export default function PublicInfo({
  profileName,
  bio,
  city,
  country,
  countryCode,
  state,
  stateCode,
  lat,
  lon,
  formattedLocation,
  influences,
  mode = "View",
}: ProfileFormSchemaWithoutId & { mode?: Mode }) {
  const isEdit = mode === "Edit";
  const fields = profileFormFields;
  const router = useRouter();
  const { setToast } = useContext(ToastContext);
  const [isFormPending, setIsFormPending] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsFormPending(true);
      const formData = new FormData(e.target as HTMLFormElement);
      const profileData = Object.fromEntries(formData.entries());

      const response = await fetch("/api/profile/edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });

      const { error, success } = await response.json();

      if (!response.ok) {
        setToast({
          message: error || "Failed to update profile",
          type: "error",
        });
        setIsFormPending(false);
        return;
      }

      if (success) {
        setToast({ message: "Profile updated successfully", type: "success" });
        router.refresh();
        router.push("/profile");
      }

      setIsFormPending(false);
    } catch (error) {
      setIsFormPending(false);
      setToast({ message: JSON.stringify(error), type: "error" });
      console.error(error);
    }
  };

  return (
    <ViewOrEditForm mode={mode} handleSubmit={handleSubmit}>
      <div className="flex flex-col gap-10 w-full border rounded-md p-4 md:p-8 bg-background">
        <div className="flex items-center justify-between w-full">
          <h2 className="font-bold uppercase  ">Public Info</h2>
          {!isEdit && (
            <Link
              href="/profile/edit/public"
              className="flex items-center gap-1"
            >
              <Pencil size={14} /> Edit
            </Link>
          )}
          {isEdit && (
            <button
              className="flex p-1 rounded items-center gap-1 hover:cursor-pointer hover:bg-white/10 transition-all"
              onClick={() => router.push("/profile")}
              type="button"
            >
              <X size={20} />
            </button>
          )}
        </div>
        <header className="flex justify-between gap-2 border-b pb-2">
          {isEdit ? (
            <ViewOrEditData title={fields.profileName.label}>
              <TextInput
                name={fields.profileName.name}
                defaultValue={profileName || ""}
                isPending={isFormPending}
                placeholder={fields.profileName.placeholder}
                maxLength={fields.profileName.maxLength}
                isEdit
                autoFocus
              />
            </ViewOrEditData>
          ) : (
            <ViewOrEditData title={fields.profileName.label}>
              <h1 className="text-lg">{profileName}</h1>
            </ViewOrEditData>
          )}
        </header>
        <div className={isEdit ? "" : "border-b pb-2"}>
          {isEdit ? (
            <ViewOrEditData title={fields.bio.label}>
              <TextArea
                defaultValue={bio || ""}
                name={fields.bio.name}
                isPending={isFormPending}
                maxLength={fields.bio.maxLength}
                placeholder={fields.bio.placeholder}
              />
            </ViewOrEditData>
          ) : (
            <ViewOrEditData title={fields.bio.label}>
              <p className="text-lg">{bio}</p>
            </ViewOrEditData>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div
            className={clsx("flex flex-col gap-2", !isEdit && "border-b pb-2")}
          >
            {isEdit ? (
              <ViewOrEditData title={fields.influences.label}>
                <MultiSelectInput
                  name={fields.influences.name}
                  defaultValues={influences ?? []}
                  maxOptionLength={fields.influences.maxLength}
                />
              </ViewOrEditData>
            ) : (
              <ViewOrEditData title={fields.influences.label}>
                <p className="text-lg">{(influences ?? []).join(", ")}</p>
              </ViewOrEditData>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-10">
          <div className="border-b pb-2">
            {isEdit ? (
              <ViewOrEditData title={fields.location.label}>
                <GeoCityInput
                  isPending={isFormPending}
                  fields={locationFormFields}
                  placeholder={fields.location.placeholder}
                  defaultValue={{
                    formattedLocation,
                    city,
                    country,
                    countryCode,
                    state,
                    stateCode,
                    lat,
                    lon,
                  }}
                />
              </ViewOrEditData>
            ) : (
              <ViewOrEditData title={fields.location.label}>
                <ProfileLocationDisplay
                  city={city}
                  stateCode={stateCode}
                  lat={lat}
                  lon={lon}
                  className="text-lg"
                />
              </ViewOrEditData>
            )}
          </div>
        </div>
        {isEdit && (
          <ActionButton type="submit" disabled={isFormPending}>
            {isFormPending ? "Saving" : "Save"}
          </ActionButton>
        )}
      </div>
    </ViewOrEditForm>
  );
}
