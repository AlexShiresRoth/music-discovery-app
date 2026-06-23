"use client";

import { ToastContext } from "@/context/toast";
import { Loader2, Trash, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";

type UploadImageAPIResponse = {
  publicUrl: string;
};

type Props = {
  imageUrl: string;
};

// TODO - clean this up a bit
export default function UploadImage({ imageUrl }: Props) {
  const router = useRouter();
  const { setToast } = useContext(ToastContext);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSaveImageToProfile = async (imageUrl: string) => {
    const res = await fetch("/api/profile/artist/edit", {
      method: "POST",
      body: JSON.stringify({ imageUrl }),
    });

    if (res.ok) {
      setToast({ message: "Image saved to profile", type: "success" });
      router.refresh();
    } else {
      setToast({ message: "Failed to save image to profile", type: "error" });
    }
  };

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    return await fetch("/api/profile/artist/upload-image", {
      method: "POST",
      body: formData,
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

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="text-sm text-gray-400/80 mb-4 mt-8 ">
        <p>{imageUrl ? imageUrl : file?.name}</p>
      </div>
      <div className="flex gap-8">
        <button
          disabled={isUploading}
          onClick={async () => {
            const file = await getFile();
            if (file) {
              setFile(file);
              const res = await handleUpload(file);

              if (res.ok) {
                const { publicUrl }: UploadImageAPIResponse = await res.json();
                await handleSaveImageToProfile(publicUrl);
                setIsUploading(false);
              } else {
                console.error("Failed to upload image");
                setIsUploading(false);
              }
            }
          }}
          className="p-2 hover:cursor-pointer border border-gray-400/80 rounded-full hover:border-indigo-500/80 transition-all text-gray-400/80 hover:text-indigo-500 disabled:hover:cursor-not-allowed disabled:animate-pulse disabled:text-emerald-500 disabled:border-emerald-500"
        >
          {isUploading ? <Loader2 className="animate-spin" /> : <Upload />}
        </button>
        <button
          disabled={isUploading}
          onClick={() => setFile(null)}
          className="p-2 hover:cursor-pointer border border-gray-400/80 rounded-full hover:border-red-500/80 transition-all text-gray-400/80 hover:text-red-500 disabled:hover:cursor-not-allowed"
        >
          <Trash />
        </button>
      </div>
    </div>
  );
}
