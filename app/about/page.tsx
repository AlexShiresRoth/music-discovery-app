import DecorativeBg from "@/components/decorative-bg";
import Footer from "@/components/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Side0 is a music discovery platform for independent artists and local scenes — before the algorithm takes over.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Side0",
    description:
      "Side0 is a music discovery platform for independent artists and local scenes — before the algorithm takes over.",
    url: "/about",
  },
};

export default function AboutPage() {
  return (
    <main className="@container flex flex-col gap-4 w-full items-center justify-center relative overflow-hidden">
      <div className="flex flex-col gap-4 w-full max-w-2xl items-center justify-center py-20">
        <h1 className="text-6xl font-bold font-serif w-full">Sidezero</h1>
        <div className="flex flex-col gap-4 border-b pb-4">
          <h2 className="text-2xl font-bold font-serif">What is it?</h2>
          <p className="text-amber-700">Another music platform?</p>
          <p>That&apos;s a fair question.</p>
          <p>Let me just set the stage before diving into the details…</p>
          <p>
            If you’re anything like me, you’ve probably opened a streaming app
            hoping to discover something new, only to be recommended the same
            old stuff again and again.
          </p>
          <p>
            Yeah, streaming services are great at helping us revisit what we
            already enjoy. But somewhere along the way, discovering something
            completely new got dragged below the depths of recommendation
            engines, trending content, and algorithms deciding what deserves our
            attention.
          </p>
          <p>
            I wanted to build something that makes music discovery simple and
            straightforward.
          </p>
          <p>
            There’s no algorithm trying to feed you what it thinks you’d like to
            hear. No recommendation engine shoving trending songs into your
            sensitive ears. No paying your way onto the main feed. No popularity
            contest.
          </p>
          <p>Is this getting too aggressive for an About page? Maybe. Idk.</p>
          <p>I digress.</p>
          <p>
            <strong>
              Sidezero is a level playing field for independent artists to share
              their music and connect with new listeners without all the added
              nonsense.
            </strong>
          </p>
          <p>
            I don’t want you to have to sell your soul to get somebody to hear
            your music. Unless you want to, of course. I’m not your dad.
          </p>
          <p>Just let the jams speak for themselves. That’s the main idea.</p>
          <p>
            Anyway, I really hope you enjoy your time here on Sidezero and find
            something cool enough that you want to share it with your friends &
            enemies.
          </p>
          <p>And feel free to say hi.</p>
          <p>- Alex.</p>
          <a href="mailto:hello@side0.com">hello@side0.com</a>
        </div>
      </div>
      <div className="absolute -z-10 translate-y-1/2">
        <DecorativeBg isPlaying={false} />
      </div>
      <Footer />
    </main>
  );
}
