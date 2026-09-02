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

function isAbortError(error: unknown) {
  return (
    (error instanceof DOMException && error.name === "AbortError") ||
    (error instanceof Error && error.name === "AbortError")
  );
}

export default function UploadImage({ imageUrl }: Props) {
  const router = useRouter();
  const { setToast } = useContext(ToastContext);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSaveImageToProfile = async (nextImageUrl: string) => {
    return await fetch("/api/profile/edit", {
      method: "POST",
      body: JSON.stringify({ imageUrl: nextImageUrl }),
    });
  };

  const handleDeleteImageFromStorage = async (safeName: string) => {
    return await fetch("/api/profile/delete-image", {
      method: "DELETE",
      body: JSON.stringify({ safeName }),
    });
  };

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

    if (typeof window === "undefined" || !window.showOpenFilePicker) {
      return null;
    }

    try {
      const [fileHandle] = await window.showOpenFilePicker(pickerOpts);
      return await fileHandle.getFile();
    } catch (error) {
      // User dismissed the picker — not a real failure.
      if (isAbortError(error)) {
        return null;
      }
      console.error(error);
      return null;
    }
  };

  const handleImageUpload = async () => {
    const selected = await getFile();
    if (!selected) {
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selected);
      const res = await fetch("/api/profile/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        setToast({ message: "Failed to upload image", type: "error" });
        return;
      }

      const { publicUrl }: UploadImageAPIResponse = await res.json();
      const saveRes = await handleSaveImageToProfile(publicUrl);

      if (!saveRes.ok) {
        setToast({
          message: "Failed to save image to profile",
          type: "error",
        });
        return;
      }

      setToast({ message: "Image saved to profile", type: "success" });
      router.refresh();
    } catch (error) {
      setToast({
        message: "Failed to upload image",
        type: "error",
      });
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async () => {
    try {
      setIsDeleting(true);
      await handleSaveImageToProfile("");
      await handleDeleteImageFromStorage(imageUrl.split("/").pop() || "");

      setToast({ message: "Image deleted", type: "success" });
      router.refresh();
    } catch (error) {
      setToast({ message: "Failed to delete image", type: "error" });
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center md:absolute md:bottom-0 md:z-10 md:right-0 w-full bg-background transition-all duration-300",
        !imageUrl && "opacity-100 md:bottom-1/3",
        imageUrl && "opacity-100 py-2 bg-background/80 backdrop-blur-sm",
      )}
    >
      <div className="text-sm my-4 md:my-1">
        <p className="truncate">
          {imageUrl && imageUrl.length > 20
            ? imageUrl.substring(0, 20) + "..."
            : imageUrl}
        </p>
        {!imageUrl && <p>Upload an image</p>}
      </div>
      <div className="flex gap-4 py-2">
        <button
          type="button"
          aria-label="Upload image"
          disabled={isDeleting || isUploading}
          onClick={handleImageUpload}
          className="p-1 hover:cursor-pointer border rounded-full hover:border-amber-500/80 transition-all hover:text-amber-500 disabled:hover:cursor-not-allowed disabled:animate-pulse disabled:text-emerald-500 disabled:border-emerald-500"
        >
          {isUploading ? (
            <Loader2 className="animate-spin" size={12} />
          ) : (
            <Upload size={12} />
          )}
        </button>
        <button
          type="button"
          aria-label="Delete image"
          disabled={isDeleting || isUploading || !imageUrl}
          onClick={handleDeleteImage}
          className="p-1 hover:cursor-pointer border rounded-full hover:border-red-500/80 transition-all hover:text-red-500 disabled:hover:cursor-not-allowed"
        >
          {isDeleting ? (
            <Loader2 className="animate-spin" size={12} />
          ) : (
            <Trash size={12} />
          )}
        </button>
      </div>
    </div>
  );
}
