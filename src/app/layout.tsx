import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Source_Serif_4, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/providers";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const sourceSerif4 = Source_Serif_4({
  weight: ["300", "400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-source-serif-4",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "yoyo — Onchain Savings Made Easy",
  description:
    "Earn up to 12% on your savings. No fees. Withdraw anytime. Powered by YO Protocol.",
  manifest: "/manifest.json",
  openGraph: {
    title: "yoyo — Onchain Savings Made Easy",
    description: "Earn up to 12% on your savings. No fees. Withdraw anytime.",
    type: "website",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "yoyo",
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFEF2",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${sourceSerif4.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
