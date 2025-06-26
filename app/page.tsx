import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import StructuredData from "./components/StructuredData"
import ActivitySelector from "./components/ActivitySelector"
import SurfboardCalculator from "./components/SurfboardCalculator"
import SpotifyPlaylist from "./components/SpotifyPlaylist"
import LocationMap from "./components/LocationMap"
import FAQSection from "./components/FAQSection"

export const metadata: Metadata = {
  title: "Summer Party Canggu - Beach & Pool Essentials in Bali",
  description:
    "Premium beach and pool essentials in Canggu, Bali. Surfboards, floaties, cooler boxes and more for your perfect summer party.",
}

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Summer Party Canggu",
  url: "https://summerpartycanggu.com",
  logo: "https://summerpartycanggu.com/logo.png",
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+6285190459091",
    contactType: "customer service",
    availableLanguage: ["English", "Indonesian"],
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Canggu",
    addressRegion: "Bali",
    addressCountry: "Indonesia",
  },
}

export default function Home() {
  return (
    <>
      <StructuredData data={organizationSchema} />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-background.png"
            alt="Summer Party Canggu - Beach Party Equipment"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        <div className="relative z-10 container-custom text-center text-white">
          <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto drop-shadow-md md:mt-20">
            Premium beach and pool essentials in Canggu, Bali. Everything you need for unforgettable moments under the
            sun.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/6285190459091?text=Hi! I'm interested in your beach and pool essentials"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-lg px-8 py-4 shadow-lg"
            >
              Get Started on WhatsApp
            </a>
            <Link href="/products" className="btn-secondary text-lg px-8 py-4 shadow-lg">
              Browse Products
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive Activity Selector */}
      <ActivitySelector />

      {/* Surfboard Calculator */}
      <SurfboardCalculator />

      {/* Spotify Playlist */}
      <SpotifyPlaylist />

      {/* Features Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">Why Choose Summer Party Canggu?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We provide premium quality gear for your perfect beach and pool experience in Bali
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-mint rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🍉</span>
              </div>
              <h3 className="font-display font-semibold text-xl mb-2">Premium Quality</h3>
              <p className="text-gray-600">Top-grade beach and pool equipment for the ultimate experience</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-coral/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="font-display font-semibold text-xl mb-2">Easy WhatsApp Booking</h3>
              <p className="text-gray-600">Quick and convenient booking through WhatsApp messaging</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-lime/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏖️</span>
              </div>
              <h3 className="font-display font-semibold text-xl mb-2">Local Canggu Experts</h3>
              <p className="text-gray-600">We know the best spots and provide local insights</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />

      {/* Location Map */}
      <LocationMap />

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-r from-teal to-coral">
        <div className="container-custom text-center text-white">
          <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">Ready for Your Summer Party?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Contact us on WhatsApp now and let's make your Canggu experience unforgettable
          </p>
          <a
            href="https://wa.me/6285190459091?text=Hi! I want to plan my summer party in Canggu"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white text-teal font-semibold py-4 px-8 rounded-full hover:bg-gray-100 transition-colors text-lg"
          >
            Message Us on WhatsApp
          </a>
        </div>
      </section>
    </>
  )
}
