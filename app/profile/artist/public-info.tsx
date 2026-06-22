"use client";
import SelectInput from "@/components/select-input";
import TextArea from "@/components/text-area";
import TextInput from "@/components/text-input";
import { COUNTRIES, GENRES, STATES } from "@/constants";
import { ToastContext } from "@/context/toast";
import { Pencil, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode, useContext, useState } from "react";
import { artistFormFields, ArtistProfileFormSchemaWithoutId } from "../schemas";
import PreHeader from "./pre-header";

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
  artistName,
  genre,
  members,
  artistDescription,
  city,
  state,
  country,
  mode = "View",
}: ArtistProfileFormSchemaWithoutId & { mode?: Mode }) {
  const isEdit = mode === "Edit";
  const fields = artistFormFields;
  const router = useRouter();
  const { setToast } = useContext(ToastContext);
  const [isFormPending, setIsFormPending] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsFormPending(true);
      const formData = new FormData(e.target as HTMLFormElement);
      const profileData = Object.fromEntries(formData.entries());

      const response = await fetch("/api/profile/artist/edit", {
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
        router.back();
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
      <div className="flex flex-col gap-10 w-full border border-gray-400/80 rounded-md p-8">
        <div className="flex items-center justify-between w-full">
          <h2 className="font-bold uppercase text-indigo-500">Public Info</h2>
          {!isEdit && (
            <Link
              href="/profile/artist/edit/public"
              className="flex items-center gap-1"
            >
              <Pencil size={14} /> Edit
            </Link>
          )}
          {isEdit && (
            <button
              className="flex p-1 rounded items-center gap-1 hover:cursor-pointer hover:bg-white/10 transition-all"
              onClick={() => router.back()}
              type="button"
            >
              <X size={20} />
            </button>
          )}
        </div>
        <header className="flex justify-between gap-2 border-b border-gray-400/80 pb-4">
          {isEdit ? (
            <ViewOrEditData title={fields.artistName.label}>
              <TextInput
                name={fields.artistName.name}
                defaultValue={artistName || ""}
                isPending={isFormPending}
                placeholder={fields.artistName.placeholder}
                isEdit
                autoFocus
              />
            </ViewOrEditData>
          ) : (
            <ViewOrEditData title={fields.artistName.label}>
              <h1 className="text-3xl font-bold uppercase">{artistName}</h1>
            </ViewOrEditData>
          )}
        </header>
        <div className="flex flex-col border-b border-gray-400/80 pb-4">
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
        <div className="flex flex-col border-b border-gray-400/80 pb-4">
          {isEdit ? (
            <ViewOrEditData title={fields.members.label}>
              <TextInput
                name={fields.members.name}
                defaultValue={members || ""}
                isPending={isFormPending}
                placeholder="Artist/Band Members"
                isEdit
              />
            </ViewOrEditData>
          ) : (
            <ViewOrEditData title={fields.members.label}>
              <p className="text-lg">{members}</p>
            </ViewOrEditData>
          )}
        </div>
        <div className={isEdit ? "" : "border-b border-gray-400/80 pb-4"}>
          {isEdit ? (
            <ViewOrEditData title={fields.artistDescription.label}>
              <TextArea
                isEdit
                defaultValue={artistDescription || ""}
                name={fields.artistDescription.name}
                isPending={isFormPending}
              />
            </ViewOrEditData>
          ) : (
            <ViewOrEditData title={fields.artistDescription.label}>
              <p className="text-lg">{artistDescription}</p>
            </ViewOrEditData>
          )}
        </div>
        <div className="flex flex-col gap-2 border-b border-gray-400/80 pb-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              {isEdit ? (
                <ViewOrEditData title={fields.city.label}>
                  <TextInput
                    isEdit
                    isPending={isFormPending}
                    name={fields.city.name}
                    defaultValue={city || ""}
                    placeholder={fields.city.placeholder}
                  />
                </ViewOrEditData>
              ) : (
                <ViewOrEditData title={fields.city.label}>
                  <p className="text-lg">{city}</p>
                </ViewOrEditData>
              )}
            </div>
            <div>
              {isEdit ? (
                <ViewOrEditData title={fields.state.label}>
                  <SelectInput
                    isEdit
                    isPending={isFormPending}
                    name={fields.state.name}
                    defaultValue={state || ""}
                    options={STATES}
                  />
                </ViewOrEditData>
              ) : (
                <ViewOrEditData title={fields.state.label}>
                  <p className="text-lg">{state}</p>
                </ViewOrEditData>
              )}
            </div>
            <div>
              {isEdit ? (
                <ViewOrEditData title={fields.country.label}>
                  <SelectInput
                    isEdit
                    isPending={isFormPending}
                    name={fields.country.name}
                    defaultValue={country || ""}
                    options={COUNTRIES}
                  />
                </ViewOrEditData>
              ) : (
                <ViewOrEditData title={fields.country.label}>
                  <p className="text-lg">{country}</p>
                </ViewOrEditData>
              )}
            </div>
          </div>
        </div>
        {isEdit && (
          <button
            type="submit"
            disabled={isFormPending}
            className="self-end px-4 py-2 rounded bg-indigo-500 uppercase text-black font-bold hover:cursor-pointer hover:bg-indigo-600 transition-colors disabled:bg-indigo-500/30"
          >
            {isFormPending ? "Saving" : "Save"}
          </button>
        )}
      </div>
    </ViewOrEditForm>
  );
}
