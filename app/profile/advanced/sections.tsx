"use client";
import ActionButton from "@/components/action-button";
import BackButton from "@/components/breadcrumbs";

function Section({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-2 border-b py-4">{children}</div>
  );
}

type Props = {
  hasProfile: boolean;
};
export default function AdvancedSettingsSections({ hasProfile }: Props) {
  return (
    <>
      {" "}
      <Section>
        <h1 className="text-4xl font-bold font-serif">Advanced Settings</h1>
        <BackButton />
      </Section>
      <Section>
        <p className="text-xl">Report an issue with the site.</p>
        <div>
          <ActionButton onClick={() => {}}>Report Issue</ActionButton>
        </div>
      </Section>
      {hasProfile && (
        <Section>
          <p className="text-xl">Hide your profile from the public.</p>
          <div>
            <ActionButton onClick={() => {}}>Hide Profile</ActionButton>
          </div>
        </Section>
      )}
      <Section>
        <p className="text-xl">Delete your account and all your data.</p>
        <div>
          <ActionButton onClick={() => {}}>
            Permanently Delete Account
          </ActionButton>
        </div>
      </Section>
    </>
  );
}
