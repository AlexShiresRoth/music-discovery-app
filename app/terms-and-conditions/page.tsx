import Footer from "@/components/footer";

export default function TermsAndConditions() {
  return (
    <main className="max-w-4xl mx-auto py-18">
      <h1 className="text-5xl font-bold font-serif">Terms of Service</h1>

      <p className="text-lg text-gray-500">Last updated: August 2026</p>

      <p>
        These Terms of Service govern your use of Side0. By creating an account
        or using Side0, you agree to these terms.
      </p>

      <section className="flex flex-col gap-4">
        <h2 className="text-3xl font-semibold">Using Side0</h2>

        <p>
          Side0 is a platform for discovering and sharing music from independent
          artists. You agree to use Side0 lawfully and in a way that does not
          harm other users or interfere with the operation of the service.
        </p>

        <p>
          You are responsible for activity associated with your account and for
          keeping your account credentials secure.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-3xl font-semibold">Your Content</h2>

        <p>
          You retain ownership of the music, images, profile information, and
          other content you upload to Side0.
        </p>

        <p>
          By uploading content, you grant Side0 a non-exclusive license to host,
          store, display, reproduce, and stream that content as necessary to
          operate and promote the Side0 service. This license ends when your
          content is deleted, except where temporary copies may remain in
          backups or where retention is required by law.
        </p>

        <p>
          You are responsible for making sure you have the rights and
          permissions necessary to upload and share your content.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-3xl font-semibold">Content Rules</h2>

        <p>
          Side0 exists to showcase music created by independent artists. Content
          uploaded to Side0 must follow our Community Guidelines.
        </p>

        <p>
          Music that is entirely AI-generated without meaningful human creative
          contribution is not permitted. Using AI or other technology as part of
          the creative process is not prohibited.
        </p>

        <p>
          You may not upload content that infringes someone else's rights,
          impersonates another person or artist, contains unlawful material, or
          otherwise violates these Terms or the Community Guidelines.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-3xl font-semibold">Copyright</h2>

        <p>
          Only upload music, artwork, photos, and other content that you own or
          have permission to use.
        </p>

        <p>
          If you believe content on Side0 infringes your copyright or other
          intellectual property rights, please contact us with enough
          information to identify the content and explain your concern.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-3xl font-semibold">Moderation</h2>

        <p>
          Side0 may remove content or restrict or terminate accounts that
          violate these Terms, the Community Guidelines, applicable law, or the
          intended use of the service.
        </p>

        <p>
          Users may report content that they believe violates these rules.
          Reports may be reviewed and appropriate action may be taken at Side0's
          discretion.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-3xl font-semibold">
          Deleting Your Profile or Account
        </h2>

        <p>
          You may delete your artist profile without deleting your Side0
          account. Deleting an artist profile permanently removes the profile
          and its associated content from Side0, subject to limited backup or
          legal retention requirements.
        </p>

        <p>
          You may also permanently delete your Side0 account. Deleting your
          account removes your account and associated personal information and
          will also remove any artist profile and content associated with the
          account, subject to limited backup or legal retention requirements.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-3xl font-semibold">
          Third-Party Services and Links
        </h2>

        <p>
          Side0 may contain links to third-party services such as streaming
          platforms, artist websites, and social media services. Side0 does not
          control and is not responsible for the content, availability, or
          practices of those services.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-3xl font-semibold">Availability of the Service</h2>

        <p>
          Side0 is provided on an "as is" and "as available" basis. We cannot
          guarantee that the service will always be available, uninterrupted,
          secure, or free from errors.
        </p>

        <p>Features may be changed, added, or removed as Side0 evolves.</p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-3xl font-semibold">Limitation of Liability</h2>

        <p>
          To the extent permitted by law, Side0 is not responsible for indirect,
          incidental, or consequential losses resulting from your use of, or
          inability to use, the service.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-3xl font-semibold">Changes to These Terms</h2>

        <p>
          These Terms may be updated as Side0 evolves. If significant changes
          are made, the "Last updated" date above will be revised. Continued use
          of Side0 after updated Terms take effect means you accept the updated
          Terms.
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-3xl font-semibold">Contact</h2>

        <p>
          If you have questions about these Terms or need to report a copyright
          concern, please contact:
        </p>

        <p>
          <a
            href="mailto:hello@side0.fm"
            className="underline underline-offset-4 hover:text-amber-700 transition-colors"
          >
            hello@side0.fm
          </a>
        </p>
      </section>
      <Footer />
    </main>
  );
}
