"use client";

import { ToastContext } from "@/context/toast";
import clsx from "clsx";
import { Loader2, Trash, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";

type UploadImageAPIResponse = {
  publicUrl: string;
};

type Props = {
  imageUrl: string;
};

export default function UploadImage({ imageUrl }: Props) {
  const router = useRouter();
  const { setToast } = useContext(ToastContext);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  /**
   *
   * @param imageUrl
   * @returns  profile with updated image url
   */
  const handleSaveImageToProfile = async (imageUrl: string) => {
    return await fetch("/api/profile/edit", {
      method: "POST",
      body: JSON.stringify({ imageUrl }),
    });
  };

  /**
   *
   * @param imageUrl
   * @returns deleted image response & profile
   */
  const handleDeleteImageFromStorage = async (imageUrl: string) => {
    return await fetch("/api/profile/delete-image", {
      method: "DELETE",
      body: JSON.stringify({ safeName: imageUrl }),
    });
  };

  /**
   *
   * @param file
   * @returns image public url
   */
  const handleUpload = async (file: File) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    return await fetch("/api/profile/upload-image", {
      method: "POST",
      body: formData,
    });
  };

  /**
   *
   * @returns image file
   */
  const getFile = async () => {
    const pickerOpts = {
      types: [
        {
          description: "Images",
          accept: {
            "image/*": [".png", ".webp", ".jpeg", ".jpg"],
          },
        },
      ],
      excludeAcceptAllOption: true,
      multiple: false,
    };
    if (typeof window !== "undefined") {
      try {
        // open file picker
        const [fileHandle] = await window?.showOpenFilePicker(pickerOpts);
        // get file contents
        const fileData = await fileHandle.getFile();
        return fileData;
      } catch {
        // if the user cancels the file picker, return null
        console.error("User cancelled file picker");
        return null;
      }
    }
  };

  /**
   *
   * @description image uploaded to storage & profile with updated image url
   */
  const handleImageUpload = async () => {
    const file = await getFile();
    if (file) {
      setFile(file);
      const res = await handleUpload(file);

      if (!res.ok) {
        setToast({ message: "Failed to upload image", type: "error" });
        console.error("Failed to upload image");
        setIsUploading(false);
        return;
      }

      if (res.ok) {
        const { publicUrl }: UploadImageAPIResponse = await res.json();
        try {
          const saveRes = await handleSaveImageToProfile(publicUrl);

          if (saveRes.ok) {
            setToast({ message: "Image saved to profile", type: "success" });
            router.refresh();
          }
        } catch (error) {
          setToast({
            message: "Failed to save image to profile",
            type: "error",
          });
          console.error(error);
        }

        setIsUploading(false);
      } else {
        console.error("Failed to upload image");
        setIsUploading(false);
      }
    }
  };

  /**
   *
   * @description image deleted from storage & profile with updated image url
   */
  const handleDeleteImage = async () => {
    try {
      setIsDeleting(true);
      await handleSaveImageToProfile("");
      await handleDeleteImageFromStorage(imageUrl.split("/").pop() || "");

      setFile(null);
      setToast({ message: "Image deleted", type: "success" });

      setIsDeleting(false);
      router.refresh();
    } catch (error) {
      setIsDeleting(false);
      setToast({ message: "Failed to delete image", type: "error" });
      console.error(error);
    }
  };

  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center md:absolute md:bottom-0 md:z-10 md:right-0 w-full h-full bg-background transition-all duration-300",
        !imageUrl && "opacity-100",
        imageUrl && "md:hover:opacity-80 md:opacity-0 opacity-100",
      )}
    >
      <div className="text-sm my-4">
        <p>{imageUrl ? imageUrl : file?.name}</p>
        {!imageUrl && <p>Upload an image</p>}
      </div>
      <div className="flex gap-4">
        <button
          disabled={isDeleting || isUploading}
          onClick={handleImageUpload}
          className="p-2 hover:cursor-pointer border rounded-full hover:border-amber-500/80 transition-all hover:text-amber-500 disabled:hover:cursor-not-allowed disabled:animate-pulse disabled:text-emerald-500 disabled:border-emerald-500"
        >
          {isUploading ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <Upload size={16} />
          )}
        </button>
        <button
          disabled={isDeleting || isUploading || !imageUrl}
          onClick={handleDeleteImage}
          className="p-2 hover:cursor-pointer border rounded-full hover:border-red-500/80 transition-all hover:text-red-500 disabled:hover:cursor-not-allowed"
        >
          <Trash size={16} />
        </button>
      </div>
    </div>
  );
}
