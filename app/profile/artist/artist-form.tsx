"use client";

import SelectInput from "@/components/select-input";
import TextArea from "@/components/text-area";
import TextInput from "@/components/text-input";
import { COUNTRIES, GENRES, STATES } from "@/constants";
import { ToastContext } from "@/context/toast";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import { artistFormFields } from "../schemas";

function Section({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-1">{children}</div>;
}

function Columns({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-4">{children}</div>;
}

function Column({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-3">{children}</div>;
}

function WideColumn({ children }: { children: React.ReactNode }) {
  return <div className="col-span-2">{children}</div>;
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b border-gray-400/80 pb-2 mb-4">
      <h2 className="text-2xl text-indigo-500 uppercase">{children}</h2>
    </div>
  );
}

export default function ArtistProfileForm() {
  const fields = artistFormFields;
  const router = useRouter();
  const [pending, setIsFormPending] = useState(false);
  const { setToast } = useContext(ToastContext);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsFormPending(true);
      const formData = new FormData(e.target as HTMLFormElement);
      const profileData = Object.fromEntries(formData.entries());

      const response = await fetch("/api/profile/artist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });

      const { error, success } = await response.json();

      if (!response.ok) {
        setToast({
          message: error || "Failed to create profile",
          type: "error",
        });
        setIsFormPending(false);
        return;
      }

      if (success) {
        setToast({ message: "Profile created successfully", type: "success" });
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
    <div className="w-full">
      <form
        className="flex flex-col gap-12 w-full mt-20"
        onSubmit={handleSubmit}
      >
        <Section>
          <Heading>Location</Heading>
          <Columns>
            <Column>
              <TextInput {...fields.fullName} isPending={pending} />
              <TextInput {...fields.contactEmail} isPending={pending} />
              <TextInput {...fields.city} isPending={pending} />
            </Column>
            <Column>
              <SelectInput
                {...fields.state}
                options={STATES}
                isPending={pending}
              />
              <SelectInput
                {...fields.country}
                options={COUNTRIES}
                isPending={pending}
              />
            </Column>
          </Columns>
        </Section>
        <Section>
          <Heading>About You</Heading>
          <Columns>
            <Column>
              <TextInput {...fields.artistName} isPending={pending} />
              <SelectInput
                {...fields.genre}
                options={GENRES}
                isPending={pending}
              />
            </Column>
            <Column>
              <TextInput {...fields.members} isPending={pending} />
            </Column>
            <WideColumn>
              <TextArea {...fields.artistDescription} isPending={pending} />
            </WideColumn>
          </Columns>
        </Section>
        <Section>
          <Heading>Social</Heading>
          <Columns>
            <Column>
              <TextInput {...fields.website} isPending={pending} />
              <TextInput {...fields.facebook} isPending={pending} />
              <TextInput {...fields.instagram} isPending={pending} />
              <TextInput {...fields.tiktok} isPending={pending} />
            </Column>
            <Column>
              <TextInput {...fields.spotify} isPending={pending} />
              <TextInput {...fields.appleMusic} isPending={pending} />
              <TextInput {...fields.soundcloud} isPending={pending} />
            </Column>
          </Columns>
        </Section>

        <button
          disabled={pending}
          type="submit"
          className="self-end px-4 py-2 bg-indigo-500 text-black rounded-md uppercase font-bold hover:bg-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
        >
          {pending ? "Creating Profile..." : "Create Profile"}
        </button>
      </form>
    </div>
  );
}
