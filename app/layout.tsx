import Navigation from "@/components/navigation";
import ToastWrapper from "@/components/toast-wrapper";
import ToastProvider from "@/context/toast";
import { getSiteUrl } from "@/lib/site-url";
import { GoogleTagManager } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Libre_Baskerville } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const libreBaskerville = Libre_Baskerville({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-libre-baskerville",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Side0",
    template: "%s · Side0",
  },
  description:
    "Discover independent artists and local scenes — no algorithms, just music nearby.",
  openGraph: {
    siteName: "Side0",
    type: "website",
    title: "Side0",
    description:
      "Discover independent artists and local scenes — no algorithms, just music nearby.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Side0",
    description:
      "Discover independent artists and local scenes — no algorithms, just music nearby.",
  },
};

// Root layout reads the visit cookie for the intro header.
export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${libreBaskerville.variable} h-full antialiased`}
    >
      <GoogleTagManager gtmId="GTM-T4J4GR93" />
      <body className="flex w-full justify-center">
        <main className="max-w-450 w-11/12">
          <Navigation />
          <ToastProvider>
            <ToastWrapper>{children}</ToastWrapper>
          </ToastProvider>
        </main>
        <Analytics />
      </body>
    </html>
  );
}
