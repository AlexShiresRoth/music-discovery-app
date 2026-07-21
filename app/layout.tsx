import Navigation from "@/components/navigation";
import ToastWrapper from "@/components/toast-wrapper";
import ToastProvider from "@/context/toast";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Music Discovery App",
  description: "Discover new local music",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex w-full justify-center">
        <main className="max-w-450 w-11/12">
          <Navigation />
          <ToastProvider>
            <ToastWrapper>{children}</ToastWrapper>
          </ToastProvider>
        </main>
      </body>
    </html>
  );
}
