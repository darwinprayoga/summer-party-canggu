import type React from "react";
import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Summer Party Canggu - Beach & Pool Essentials in Bali",
    template: "%s | Summer Party Canggu",
  },
  description:
    "Premium beach and pool essentials in Canggu, Bali. Surfboards, floaties, cooler boxes and more for your perfect summer party.",
  keywords: [
    "Canggu",
    "Bali",
    "beach essentials",
    "pool gear",
    "surfboards",
    "summer party",
  ],
  authors: [{ name: "Summer Party Canggu" }],
  creator: "Summer Party Canggu",
  icons: {
    icon: [
      { url: "/favicon.webp", sizes: "32x32", type: "image/webp" },
      { url: "/favicon.webp", sizes: "16x16", type: "image/webp" },
    ],
    apple: [{ url: "/favicon.webp", sizes: "180x180", type: "image/webp" }],
    shortcut: "/favicon.webp",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://summerpartycanggu.com",
    siteName: "Summer Party Canggu",
    title: "Summer Party Canggu - Beach & Pool Essentials in Bali",
    description:
      "Premium beach and pool essentials in Canggu, Bali. Surfboards, floaties, cooler boxes and more for your perfect summer party.",
    images: [
      {
        url: "/icon-landscape.webp",
        width: 1200,
        height: 630,
        alt: "Summer Party Canggu - Beach & Pool Essentials",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Summer Party Canggu - Beach & Pool Essentials in Bali",
    description:
      "Premium beach and pool essentials in Canggu, Bali. Surfboards, floaties, cooler boxes and more for your perfect summer party.",
    images: ["/icon-landscape.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <head>
        <link rel="icon" href="/favicon.webp" type="image/webp" />
        <link rel="apple-touch-icon" href="/favicon.webp" />
        <link rel="shortcut icon" href="/favicon.webp" />
      </head>
      <body className="font-sans bg-cream text-charcoal">
        <Header />
        <Analytics />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
