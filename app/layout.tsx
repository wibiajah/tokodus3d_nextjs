import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Ubuntu } from "next/font/google";
import "./globals.css";
import SWRProvider from "@/app/swr-provider";
import SWRPreloader from "@/components/preload";
import AuthBridgeWrapper from "@/components/auth-bridge-wrapper";
import SessionBanner from "@/components/session-banner";

const ubuntu = Ubuntu({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-ubuntu",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tokodus",
  description: "Box Model Config",
  generator: "time, knowledge, consistency",
  icons: {
    icon: "/logo-icon.png",
    shortcut: "/logo-icon.png",
    apple: "/logo-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo-icon.png" type="image/png" />
      </head>
      <body
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable} ${ubuntu.variable}`}
      >
        <SWRProvider>
          {/* Preload data statis dari Laravel */}
          <SWRPreloader />
          {/* Auth bridge: baca token ?t= dari URL, restore sesi customer */}
          <AuthBridgeWrapper />
          {children}
          {/* Banner notifikasi: session expired, retry gagal, dll */}
          <SessionBanner />
        </SWRProvider>
      </body>
    </html>
  );
}