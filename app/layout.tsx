import Navigation from "@/components/navigation";
import ToastWrapper from "@/components/toast-wrapper";
import ToastProvider from "@/context/toast";
import { getSiteUrl } from "@/lib/site-url";
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
    default: "Music Discovery App",
    template: "%s · Music Discovery App",
  },
  description:
    "Discover independent artists and local scenes — no algorithms, just music nearby.",
  openGraph: {
    siteName: "Music Discovery App",
    type: "website",
    title: "Music Discovery App",
    description:
      "Discover independent artists and local scenes — no algorithms, just music nearby.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Music Discovery App",
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
