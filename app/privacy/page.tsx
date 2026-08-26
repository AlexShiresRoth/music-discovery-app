import Footer from "@/components/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Side0 collects, uses, and protects your information. We do not sell your personal data.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Privacy Policy · Side0",
    description:
      "How Side0 collects, uses, and protects your information. We do not sell your personal data.",
    url: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <main className="max-w-4xl mx-auto py-18">
      <h1 className="text-5xl font-bold font-serif">Privacy Policy</h1>

      <p className="text-lg text-gray-500">Last updated: August 2026</p>

      <p>
        Side0 collects only the information needed to provide the service. We do
        not sell your personal information or collect more data than necessary.
      </p>

      <section className="flex flex-col gap-4">
        <h2 className="text-3xl font-semibold">Information We Collect</h2>

        <p>When you create an account or use Side0, we may collect:</p>

        <ul className="list-disc pl-6 space-y-2">
          <li>Your email address and account information.</li>
          <li>Information you choose to add to your profile.</li>
          <li>Audio clips, images, and other content you upload.</li>
          <li>
            Basic analytics to understand how Side0 is being used and improve
            the experience.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-3xl font-semibold">Location Information</h2>

        <p>
          If you choose to use location-based discovery, Side0 will ask for
          permission to access your device&apos;s location. Your location is
          used only to find nearby artists and is <strong>not</strong> stored as
          part of your account or used to track your activity.
        </p>

        <p>
          If you create an artist profile, the location information you choose
          to provide (such as your city or region) may be displayed publicly on
          your profile to help listeners discover your music.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-3xl font-semibold">How Your Information Is Used</h2>

        <p>Your information is used to:</p>

        <ul className="list-disc pl-6 space-y-2">
          <li>Create and manage your account.</li>
          <li>Display your artist profile and uploaded content.</li>
          <li>Help listeners discover artists and music.</li>
          <li>Improve Side0 and fix issues.</li>
        </ul>

        <p>
          <strong>Side0 does not sell your personal information.</strong>
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-3xl font-semibold">Third-Party Services</h2>

        <p>
          Side0 relies on trusted third-party services to operate, including:
        </p>

        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Supabase</strong> for authentication, database, and file
            storage.
          </li>
          <li>
            <strong>Vercel</strong> for hosting and analytics.
          </li>
        </ul>

        <p>
          These services may process information as necessary to provide their
          functionality.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-3xl font-semibold">Your Content</h2>

        <p>
          You retain ownership of the music, images, and other content you
          upload.
        </p>

        <p>
          By uploading content to Side0, you grant Side0 a limited license to
          store, display, and stream your content within the app.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-3xl font-semibold">Deleting Your Account</h2>

        <p>
          You can permanently delete your account at any time from your account
          settings. Deleting your account permanently removes your account,
          profile, uploaded content, and associated personal information from
          Side0, except where information must be retained to comply with legal
          obligations.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-3xl font-semibold">Changes to This Policy</h2>

        <p>
          This Privacy Policy may be updated from time to time. If significant
          changes are made, the &quot;Last updated&quot; date above will be
          revised.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-3xl font-semibold">Contact</h2>

        <p>
          If you have any questions about this Privacy Policy, please contact:
        </p>

        <p>
          <a
            href="mailto:hello@side0.com"
            className="underline underline-offset-4 hover:text-amber-700 transition-colors"
          >
            hello@side0.com
          </a>
        </p>
      </section>
      <Footer />
    </main>
  );
}
