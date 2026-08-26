import DecorativeBg from "@/components/decorative-bg";
import Footer from "@/components/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community Guidelines",
  description:
    "Rules for sharing music and discovering artists on Side0 — no spam, harassment, or stolen work.",
  alternates: {
    canonical: "/community-guidelines",
  },
  openGraph: {
    title: "Community Guidelines · Side0",
    description:
      "Rules for sharing music and discovering artists on Side0 — no spam, harassment, or stolen work.",
    url: "/community-guidelines",
  },
};

export default function CommunityGuidelines() {
  return (
    <main className="@container flex flex-col gap-4 w-full items-center justify-center relative overflow-hidden">
      <div className="flex flex-col gap-4 w-full max-w-2xl items-center justify-center py-20">
        <header className="flex flex-col gap-4">
          <h1 className="font-serif text-5xl font-bold">
            Community Guidelines
          </h1>

          <p className="text-lg text-gray-500">
            Side0 is a place for independent artists to share their music and
            for listeners to discover something new.
          </p>

          <p>
            We want artists to have room to express themselves without turning
            Side0 into a place filled with spam, harassment, stolen work, or
            content that has nothing to do with why we&apos;re here.
          </p>

          <p>These guidelines explain where we draw those lines.</p>
        </header>

        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold">
            Share Work You Have the Right to Share
          </h2>

          <p>
            Only upload music, artwork, photos, and other content that you
            created or have permission to use.
          </p>

          <p>
            Don&apos;t upload another artist&apos;s work without permission,
            pretend to represent an artist you don&apos;t, or claim someone
            else&apos;s work as your own.
          </p>

          <p>
            Bands, collaborations, producers, labels, and other shared projects
            are welcome as long as you have the right to represent and share the
            work.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold">Keep the Music Human</h2>

          <p>
            Side0 exists to help people discover music created by independent
            artists.
          </p>

          <p>
            Using AI as a tool during the creative process is okay. That might
            include production, mixing, mastering, experimentation, artwork, or
            other forms of creative assistance.
          </p>

          <p>
            Music that is entirely AI-generated without meaningful human
            creative contribution, however, isn&apos;t what Side0 is intended
            for and may be removed.
          </p>

          <p>
            We&apos;re not interested in policing the tools artists use. We
            simply want Side0 to remain a place for discovering{" "}
            <strong>people who make music</strong>.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold">Respect Other People</h2>

          <p>
            Don&apos;t use Side0 to harass, threaten, intimidate, impersonate,
            or deliberately target another person.
          </p>

          <p>
            Music and art can be provocative. Explicit lyrics, criticism,
            political expression, difficult subjects, and controversial ideas
            aren&apos;t violations simply because someone finds them offensive.
          </p>

          <p>
            There is a difference, however, between artistic expression and
            using the platform to threaten, harass, or encourage violence
            against other people.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold">Sexual and Graphic Content</h2>

          <p>
            Pornographic or sexually explicit visual content isn&apos;t
            permitted on Side0.
          </p>

          <p>
            Graphic images depicting severe real-world violence, injury, or gore
            may also be removed.
          </p>

          <p>
            Music can address sexual, violent, political, disturbing, or
            otherwise mature subjects. These guidelines aren&apos;t intended to
            sanitize artistic expression simply because a song explores
            uncomfortable ideas.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold">
            Don&apos;t Spam or Manipulate the Platform
          </h2>

          <p>
            Don&apos;t flood Side0 with duplicate uploads, fake profiles, scams,
            advertisements, misleading information, or other content intended to
            manipulate or disrupt discovery.
          </p>

          <p>
            Don&apos;t artificially manipulate engagement or attempt to game
            Side0&apos;s systems.
          </p>

          <p>
            Side0 is supposed to make discovering independent music simpler.
            Please don&apos;t make it harder.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold">Reporting Content</h2>

          <p>
            If you believe an artist, profile, song, or other content violates
            these guidelines, you can report it from within Side0.
          </p>

          <p>
            You must be signed in to submit an in-app report. Reports are
            confidential, and the person you report will not be told who
            submitted it.
          </p>

          <p>
            A report does not automatically result in content being removed.
            Reports may be reviewed in context before action is taken.
          </p>

          <p>
            Copyright, privacy, or other legal concerns can be reported directly
            to{" "}
            <a
              href="mailto:hello@side0.com"
              className="underline underline-offset-4"
            >
              hello@side0.com
            </a>{" "}
            without creating a Side0 account.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold">
            What Happens When the Rules Are Broken?
          </h2>

          <p>
            Depending on the circumstances, Side0 may remove content, restrict
            access to features, suspend an account, or permanently remove an
            account from the platform.
          </p>

          <p>
            Not every situation requires the same response. Context, severity,
            repeated violations, and whether something appears intentional may
            all be considered.
          </p>

          <p>
            We also reserve the right to take action when behavior clearly
            undermines the purpose or safety of the platform, even if a specific
            situation isn&apos;t perfectly described above.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold">That&apos;s Pretty Much It</h2>

          <p>
            Side0 exists because discovering an artist you&apos;ve never heard
            before can be exciting.
          </p>

          <p>
            Help keep it a place where musicians can comfortably share what
            they&apos;ve made and listeners can wander around and find something
            unexpected.
          </p>

          <p className="font-semibold">
            Share your work. Respect other people. Keep discovery interesting.
          </p>
        </section>
      </div>
      <div className="absolute -z-10 translate-y-1/2">
        <DecorativeBg isPlaying={false} />
      </div>
      <Footer />
    </main>
  );
}
