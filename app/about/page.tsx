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
        <div className="flex flex-col gap-4 border-b pb-4">
          <h1 className="text-6xl font-bold font-serif">Sidezero</h1>
          <p>
            The idea behind the name is a play on how records usually contain a
            side A and side B.
          </p>
          <p>
            Side0 is what comes before Side A and Side B. It&apos;s the moment
            when an artist is still being discovered.
          </p>
        </div>
        <div className="flex flex-col gap-4 border-b pb-4">
          <h2 className="text-2xl font-bold font-serif">
            So what is Sidezero?
          </h2>
          <p className="text-amber-700">Another music platform?</p>
          <p>That&apos;s a fair question.</p>
          <p>
            If you&apos;re anything like me, you&apos;ve probably opened a
            streaming app hoping to discover something new, only to be
            recommended familiar artists and songs. Streaming services are great
            at helping us revisit what we already enjoy. I wanted to build
            something that made exploring the unknown feel just as easy.
          </p>
        </div>
        <div className="flex flex-col gap-4 border-b pb-4">
          <p>
            I built this because I missed the feeling of stumbling across a new
            artist or song that I&apos;d never heard before. I&apos;m not trying
            to compete with streaming platforms. I&apos;m trying to make
            discovering independent artists simple again. There are no
            popularity rankings and no endless recommendations telling you what
            you should hear next.
          </p>
          <p>Every artist starts somewhere.</p>
          <p>
            This is a place to hear the musicians who are still building their
            audience, whether they&apos;re down the street or across the
            country.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <p>
            Thank you for stopping by. I hope you discover an artist that
            excites you enough to share with someone else.
          </p>
          <p>- Alex.</p>
        </div>
      </div>
      <div className="absolute -z-10 translate-y-1/2">
        <DecorativeBg isPlaying={false} />
      </div>
      <Footer />
    </main>
  );
}
