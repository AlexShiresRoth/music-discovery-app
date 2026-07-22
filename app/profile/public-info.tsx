"use client";
import SelectInput from "@/components/select-input";
import TextArea from "@/components/text-area";
import TextInput from "@/components/text-input";
import { GENRES } from "@/constants";
import { ToastContext } from "@/context/toast";
import { Pencil, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode, useContext, useState } from "react";
import GeoCityInput from "./geo-city-input";
import PreHeader from "./pre-header";
import { profileFormFields, ProfileFormSchemaWithoutId } from "./schemas";

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
  genre,
  bio,
  city,
  state,
  country,
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
        <header className="flex justify-between gap-2 border-b pb-4">
          {isEdit ? (
            <ViewOrEditData title={fields.profileName.label}>
              <TextInput
                name={fields.profileName.name}
                defaultValue={profileName || ""}
                isPending={isFormPending}
                placeholder={fields.profileName.placeholder}
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
        <div className="flex flex-col border-b pb-4">
          {isEdit ? (
            <ViewOrEditData title={fields.genre.label}>
              <SelectInput
                name={fields.genre.name}
                defaultValue={genre || ""}
                isPending={isFormPending}
                options={GENRES}
                isEdit
              />
            </ViewOrEditData>
          ) : (
            <ViewOrEditData title={fields.genre.label}>
              <p className="text-lg">{genre}</p>
            </ViewOrEditData>
          )}
        </div>
        <div className={isEdit ? "" : "border-b pb-4"}>
          {isEdit ? (
            <ViewOrEditData title={fields.bio.label}>
              <TextArea
                isEdit
                defaultValue={bio || ""}
                name={fields.bio.name}
                isPending={isFormPending}
              />
            </ViewOrEditData>
          ) : (
            <ViewOrEditData title={fields.bio.label}>
              <p className="text-lg">{bio}</p>
            </ViewOrEditData>
          )}
        </div>

        <div className="flex flex-col gap-10">
          <div className="border-b pb-4">
            {isEdit ? (
              <ViewOrEditData title={fields.city.label}>
                <GeoCityInput
                  isPending={isFormPending}
                  name={fields.city.name}
                  defaultValue={city ?? ""}
                  placeholder={fields.city.placeholder ?? ""}
                />
              </ViewOrEditData>
            ) : (
              <ViewOrEditData title={fields.city.label}>
                <p className="text-lg">{city}</p>
              </ViewOrEditData>
            )}
          </div>
        </div>
        {isEdit && (
          <button
            type="submit"
            disabled={isFormPending}
            className="self-end px-4 py-2 rounded bg-amber-500 uppercase text-black font-bold hover:cursor-pointer hover:bg-amber-600 transition-colors disabled:bg-amber-500/30"
          >
            {isFormPending ? "Saving" : "Save"}
          </button>
        )}
      </div>
    </ViewOrEditForm>
  );
}
