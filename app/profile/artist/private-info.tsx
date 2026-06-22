"use client";
import TextInput from "@/components/text-input";
import { ToastContext } from "@/context/toast";
import { Pencil, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import MembersWithAccess from "../members-with-access";
import { artistFormFields, ArtistProfileFormSchemaWithoutId } from "../schemas";
import PreHeader from "./pre-header";

type Mode = "Edit" | "View";

export default function PrivateInfo({
  fullName,
  contactEmail,
  joinedDate,
  membersWithAccess,
  mode = "View",
}: ArtistProfileFormSchemaWithoutId & {
  membersWithAccess: string[];
  joinedDate: Date | null;
  mode?: Mode;
}) {
  const isEdit = mode === "Edit";
  const fields = artistFormFields;
  const router = useRouter();
  const { setToast } = useContext(ToastContext);
  const [isFormPending, setIsFormPending] = useState(false);
  const date = new Date(joinedDate || "").toLocaleDateString();

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsFormPending(true);
      const formData = new FormData(e.target as HTMLFormElement);
      const profileData = Object.fromEntries(formData.entries());

      const response = await fetch("/api/profile/artist/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });

      const { error, success } = await response.json();

      if (!response.ok) {
        setToast({ message: error || "Failed to update profile", type: "error" });
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

  const content = (
    <div className="flex flex-col gap-10 w-full border border-gray-400/80 rounded-md p-8">
      <div className="flex items-center justify-between w-full">
        <h2 className="font-bold uppercase text-indigo-500">Private Info</h2>
        {!isEdit && (
          <Link href="/profile/artist/edit/private" className="flex items-center gap-1">
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
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-4 border-b border-gray-400/80 pb-4">
          <div>
            {isEdit ? (
              <>
                <PreHeader>{fields.fullName.label}</PreHeader>
                <TextInput
                  name={fields.fullName.name}
                  defaultValue={fullName || ""}
                  isPending={isFormPending}
                  placeholder={fields.fullName.placeholder}
                  isEdit
                  autoFocus
                />
              </>
            ) : (
              <>
                <PreHeader>Full Name</PreHeader>
                <p className="text-lg">{fullName}</p>
              </>
            )}
          </div>
          <div>
            {isEdit ? (
              <>
                <PreHeader>{fields.contactEmail.label}</PreHeader>
                <TextInput
                  name={fields.contactEmail.name}
                  defaultValue={contactEmail || ""}
                  isPending={isFormPending}
                  placeholder={fields.contactEmail.placeholder}
                  isEdit
                />
              </>
            ) : (
              <>
                <PreHeader>Contact Email</PreHeader>
                <p className="text-lg">{contactEmail}</p>
              </>
            )}
          </div>
          <div>
            <PreHeader>Joined Date</PreHeader>
            <p className="text-lg">{date}</p>
          </div>
        </div>
        <div>
          <PreHeader>Members with Access</PreHeader>
          <MembersWithAccess membersWithAccess={membersWithAccess} />
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
  );

  return isEdit ? (
    <form onSubmit={handleSubmit}>{content}</form>
  ) : (
    content
  );
}
