import type React from "react";
import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";

const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://summer.prayoga.io"),
  title: {
    default:
      "Summer Party Canggu - Premium Beach & Pool Equipment Rental in Bali",
    template: "%s | Summer Party Canggu - Bali Beach Activities",
  },
  description:
    "Premium beach and pool equipment rental in Canggu, Bali. Surfboards, party essentials, and beach gear for the ultimate Bali experience. Free surfboard size calculator and local surf guides.",
  keywords: [
    "Canggu beach equipment",
    "Bali surfboard rental",
    "beach party Bali",
    "pool party equipment Canggu",
    "surf lessons Bali",
    "Bali beach activities",
    "Canggu surf spots",
    "Uluwatu surfboard rental",
    "Bali party planning",
    "beach essentials Bali",
    "surfboard size calculator",
    "Bali surf guide",
    "Seminyak beach equipment",
    "Sanur beach activities",
  ],
  authors: [{ name: "Summer Party Canggu", url: "https://summer.prayoga.io" }],
  creator: "Summer Party Canggu",
  publisher: "Summer Party Canggu",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any", type: "image/x-icon" }, // for Google
      { url: "/favicon.ico", sizes: "32x32", type: "image/webp" },
      { url: "/favicon.ico", sizes: "16x16", type: "image/webp" },
    ],
    apple: [{ url: "/favicon.ico", sizes: "180x180", type: "image/webp" }],
    shortcut: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://summer.prayoga.io",
    siteName: "Summer Party Canggu",
    title:
      "Summer Party Canggu - Premium Beach & Pool Equipment Rental in Bali",
    description:
      "Premium beach and pool equipment rental in Canggu, Bali. Surfboards, party essentials, and beach gear for the ultimate Bali experience. Free surfboard size calculator included.",
    images: [
      {
        url: "/icon-landscape.webp",
        width: 1200,
        height: 630,
        alt: "Summer Party Canggu - Premium Beach & Pool Equipment Rental in Bali",
        type: "image/webp",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Summer Party Canggu - Premium Beach & Pool Equipment Rental in Bali",
    description:
      "Premium beach and pool equipment rental in Canggu, Bali. Surfboards, party essentials, and beach gear for the ultimate Bali experience.",
    images: ["/icon-landscape.webp"],
    creator: "@summerpartycanggu",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://summer.prayoga.io",
    languages: {
      "en-US": "https://summer.prayoga.io",
      "id-ID": "https://summer.prayoga.io/id",
    },
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
  },
  category: "Travel & Tourism",
  classification: "Beach Equipment Rental, Surf Shop, Party Planning",
  other: {
    "geo.region": "ID-BA",
    "geo.placename": "Canggu, Bali, Indonesia",
    "geo.position": "-8.6500;115.1333",
    ICBM: "-8.6500, 115.1333",
    "DC.title": "Summer Party Canggu - Beach Equipment Rental Bali",
    "DC.creator": "Summer Party Canggu",
    "DC.subject":
      "Beach Equipment, Surfboard Rental, Party Planning, Bali Activities",
    "DC.description":
      "Premium beach and pool equipment rental service in Canggu, Bali",
    "DC.publisher": "Summer Party Canggu",
    "DC.contributor": "Local Bali Surf Experts",
    "DC.date": new Date().toISOString(),
    "DC.type": "Service",
    "DC.format": "text/html",
    "DC.identifier": "https://summer.prayoga.io",
    "DC.language": "en-US",
    "DC.coverage": "Bali, Indonesia",
    "DC.rights": "Copyright Summer Party Canggu",
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
        {/* Preload critical resources */}
        <link
          rel="preload"
          href="/hero-background.png"
          as="image"
          type="image/png"
        />
        <link
          rel="preload"
          href="/hero-background-mobile.png"
          as="image"
          type="image/png"
        />
        <link rel="preload" href="/logo.webp" as="image" type="image/webp" />

        {/* DNS prefetch for external domains */}
        <link rel="dns-prefetch" href="//wa.me" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//vercel.live" />

        {/* Preconnect to critical third-party origins */}
        <link rel="preconnect" href="https://wa.me" crossOrigin="anonymous" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        <meta
          property="og:site_name"
          content="Summer Party Canggu | Essentials: 🥂 Party, 🛟 Pool, 🏄‍♂️ Beach"
        />
        <meta name="twitter:site" content="@summerparty.canggu" />
        <meta
          name="application-name"
          content="Summer Party Canggu | Essentials: 🥂 Party, 🛟 Pool, 🏄‍♂️ Beach"
        />

        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" type="image/webp" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
        <link rel="shortcut icon" href="/favicon.ico" />

        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#2CA3A7" />
        <meta name="msapplication-TileColor" content="#2CA3A7" />

        {/* Viewport optimization */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes"
        />

        {/* Performance hints */}
        <meta httpEquiv="x-dns-prefetch-control" content="on" />

        {/* Security headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="Referrer-Policy" content="origin-when-cross-origin" />
      </head>
      <body className="font-sans bg-cream text-charcoal antialiased">
        <Suspense fallback={<div>Loading...</div>}>
          <Header />
          <Analytics />
          <main>{children}</main>
          <Footer />
        </Suspense>

        {/* Structured Data for Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Summer Party Canggu",
              url: "https://summer.prayoga.io",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate:
                    "https://summer.prayoga.io/search?q={search_term_string}",
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </body>
    </html>
  );
}
