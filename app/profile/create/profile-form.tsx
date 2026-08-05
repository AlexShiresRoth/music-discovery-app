"use client";

import ActionButton from "@/components/action-button";
import GeoCityInput from "@/components/geo-city-input";
import TextArea from "@/components/text-area";
import TextInput from "@/components/text-input";
import { ToastContext } from "@/context/toast";
import { validateSocialFields } from "@/lib/validation/url";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import { profileFormFields } from "../schemas";

function Section({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-1">{children}</div>;
}

function Columns({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-4">{children}</div>;
}

function Column({
  children,
  span = 1,
}: {
  children: React.ReactNode;
  span?: number;
}) {
  return (
    <div className={`flex flex-col gap-3 col-span-${span}`}>{children}</div>
  );
}

function WideColumn({ children }: { children: React.ReactNode }) {
  return <div className="col-span-2">{children}</div>;
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b pb-2 mb-4">
      <h2 className="text-2xl uppercase">{children}</h2>
    </div>
  );
}

export default function ProfileForm() {
  const fields = profileFormFields;
  const router = useRouter();
  const [pending, setIsFormPending] = useState(false);
  const { setToast } = useContext(ToastContext);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsFormPending(true);
      const formData = new FormData(e.target as HTMLFormElement);
      const profileData = Object.fromEntries(formData.entries());

      const socialValidation = validateSocialFields(profileData);
      if (!socialValidation.ok) {
        setToast({ message: socialValidation.error, type: "error" });
        setIsFormPending(false);
        return;
      }

      const response = await fetch("/api/profile/create", {
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
            </Column>
            <Column>
              <TextInput {...fields.contactEmail} isPending={pending} />
            </Column>
            <Column span={2}>
              <label
                htmlFor={fields.location.name}
                className="ml-2 text-sm font-semibold"
              >
                {fields.location.label}
              </label>
              <div className="border rounded-md p-2 py-4">
                <GeoCityInput
                  placeholder={fields.location.placeholder}
                  defaultValue={null}
                  isPending={pending}
                />
              </div>
            </Column>
          </Columns>
        </Section>
        <Section>
          <Heading>About You</Heading>
          <Columns>
            <Column>
              <TextInput {...fields.profileName} isPending={pending} />
            </Column>
            <WideColumn>
              <TextArea {...fields.bio} isPending={pending} />
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

        <ActionButton disabled={pending} type="submit">
          {pending ? "Creating Profile..." : "Create Profile"}
        </ActionButton>
      </form>
    </div>
  );
}
