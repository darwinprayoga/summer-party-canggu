import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import StructuredData from "./components/StructuredData";
import ActivitySelector from "./components/ActivitySelector";
import SurfboardCalculator from "./components/SurfboardCalculator";
import SpotifyPlaylist from "./components/SpotifyPlaylist";
import LocationMap from "./components/LocationMap";
import FAQSection from "./components/FAQSection";

export const metadata: Metadata = {
  title: "Summer Party Canggu - Beach & Pool Essentials in Bali",
  description:
    "Premium beach and pool essentials in Canggu, Bali. Surfboards, floaties, cooler boxes and more for your perfect summer party.",
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": ["Organization", "LocalBusiness", "TouristInformationCenter"],
  name: "Summer Party Canggu",
  alternateName: "Summer Party Bali",
  description:
    "Premium beach and pool party equipment rental service in Canggu, Bali. Specializing in surfboard rentals, beach essentials, and party equipment for the ultimate Bali experience.",
  url: "https://summer.prayoga.io",
  logo: {
    "@type": "ImageObject",
    url: "https://summer.prayoga.io/logo.webp",
    width: 200,
    height: 60,
  },
  image: "https://summer.prayoga.io/icon-landscape.webp",
  telephone: "+6285190459091",
  email: "info@summer.prayoga.io",
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: "+6285190459091",
      contactType: "customer service",
      availableLanguage: ["English", "Indonesian", "Bahasa Indonesia"],
      areaServed: "Bali, Indonesia",
      serviceUrl: "https://wa.me/6285190459091",
    },
  ],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Canggu",
    addressRegion: "Bali",
    addressCountry: "Indonesia",
    postalCode: "80361",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: -8.65,
    longitude: 115.1333,
  },
  openingHours: ["Mo-Su 08:00-20:00"],
  priceRange: "$$",
  currenciesAccepted: ["IDR", "USD"],
  paymentAccepted: ["Cash", "Bank Transfer", "Digital Payment"],
  areaServed: [
    {
      "@type": "Place",
      name: "Canggu, Bali",
    },
    {
      "@type": "Place",
      name: "Seminyak, Bali",
    },
    {
      "@type": "Place",
      name: "Uluwatu, Bali",
    },
    {
      "@type": "Place",
      name: "Sanur, Bali",
    },
  ],
  serviceArea: {
    "@type": "GeoCircle",
    geoMidpoint: {
      "@type": "GeoCoordinates",
      latitude: -8.65,
      longitude: 115.1333,
    },
    geoRadius: "50000",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Beach and Pool Party Equipment Rental",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Product",
          name: "Second-Hand Surfboards",
          description:
            "Quality pre-owned surfboards perfect for all skill levels. Various sizes and designs available - from beginner-friendly longboards to performance shortboards.",
          image:
            "https://summer.prayoga.io/products/second-hand-surfboards.jpeg",
          category: "Surf Equipment",
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.8",
            reviewCount: "15",
          },
          review: {
            "@type": "Review",
            reviewRating: {
              "@type": "Rating",
              ratingValue: "5",
              bestRating: "5",
            },
            author: {
              "@type": "Person",
              name: "Bali Surfer",
            },
            reviewBody:
              "Awesome board! Took it out in Canggu and it rode like new.",
          },
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "IDR",
            availability: "http://schema.org/InStock",
            priceValidUntil: "2025-12-31",
            url: "https://summer.prayoga.io/products/second-hand-surfboards",
            shippingDetails: {
              "@type": "OfferShippingDetails",
              shippingDestination: {
                "@type": "DefinedRegion",
                addressCountry: "ID",
              },
            },
            hasMerchantReturnPolicy: {
              "@type": "MerchantReturnPolicy",
              applicableCountry: "ID",
              returnPolicyCategory: "http://schema.org/NoReturns",
            },
          },
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Product",
          name: "Adult Gray Pool Float",
          description:
            "Perfect for relaxing in style. Durable, comfy, and pool-ready with comfortable air pocket design for ultimate relaxation.",
          image: "https://summer.prayoga.io/products/adult-gray-float.png",
          category: "Pool Equipment",
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.6",
            reviewCount: "10",
          },
          review: {
            "@type": "Review",
            reviewRating: {
              "@type": "Rating",
              ratingValue: "5",
              bestRating: "5",
            },
            author: {
              "@type": "Person",
              name: "Pool Enthusiast",
            },
            reviewBody: "Really comfy and perfect for sunny afternoons.",
          },
          offers: {
            "@type": "Offer",
            price: "100000",
            priceCurrency: "IDR",
            availability: "http://schema.org/InStock",
            priceValidUntil: "2025-12-31",
            url: "https://summer.prayoga.io/products/adult-gray-pool-float",
            shippingDetails: {
              "@type": "OfferShippingDetails",
              shippingDestination: {
                "@type": "DefinedRegion",
                addressCountry: "ID",
              },
            },
            hasMerchantReturnPolicy: {
              "@type": "MerchantReturnPolicy",
              applicableCountry: "ID",
              returnPolicyCategory: "http://schema.org/NoReturns",
            },
          },
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Product",
          name: "Rainbow Beach Ball",
          description:
            "Classic beach ball fun, lightweight, bouncy, and splash-approved. Perfect for pool games and beach activities.",
          image: "https://summer.prayoga.io/products/rainbow-beach-ball.png",
          category: "Beach Equipment",
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.9",
            reviewCount: "25",
          },
          review: {
            "@type": "Review",
            reviewRating: {
              "@type": "Rating",
              ratingValue: "5",
              bestRating: "5",
            },
            author: {
              "@type": "Person",
              name: "Holiday Lover",
            },
            reviewBody: "So fun! Kids loved it at the beach.",
          },
          offers: {
            "@type": "Offer",
            price: "50000",
            priceCurrency: "IDR",
            availability: "http://schema.org/InStock",
            priceValidUntil: "2025-12-31",
            url: "https://summer.prayoga.io/products/rainbow-beach-ball",
            shippingDetails: {
              "@type": "OfferShippingDetails",
              shippingDestination: {
                "@type": "DefinedRegion",
                addressCountry: "ID",
              },
            },
            hasMerchantReturnPolicy: {
              "@type": "MerchantReturnPolicy",
              applicableCountry: "ID",
              returnPolicyCategory: "http://schema.org/NoReturns",
            },
          },
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Product",
          name: "Balinese Arak",
          description:
            "Authentic Balinese rice wine with a fun tropical twist! Perfect for beach parties and cultural celebrations. Traditional distilled spirit with modern Summer Party Canggu branding.",
          image: "https://summer.prayoga.io/products/balinese-arak-bottle.png",
          category: "Cultural Experiences",
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.7",
            reviewCount: "8",
          },
          review: {
            "@type": "Review",
            reviewRating: {
              "@type": "Rating",
              ratingValue: "5",
              bestRating: "5",
            },
            author: {
              "@type": "Person",
              name: "Traveler from Ubud",
            },
            reviewBody:
              "A unique cultural taste! Goes great with summer vibes.",
          },
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "IDR",
            availability: "http://schema.org/InStock",
            priceValidUntil: "2025-12-31",
            url: "https://summer.prayoga.io/products/balinese-arak-summer-edition",
            shippingDetails: {
              "@type": "OfferShippingDetails",
              shippingDestination: {
                "@type": "DefinedRegion",
                addressCountry: "ID",
              },
            },
            hasMerchantReturnPolicy: {
              "@type": "MerchantReturnPolicy",
              applicableCountry: "ID",
              returnPolicyCategory: "http://schema.org/NoReturns",
            },
          },
        },
      },
    ],
  },
  makesOffer: [
    {
      "@type": "Offer",
      name: "Surfboard Size Calculator",
      description:
        "Free online tool to calculate perfect surfboard size for Bali surf conditions",
      url: "https://summer.prayoga.io/#surfboard-calculator",
      price: "0",
      priceCurrency: "USD",
    },
  ],
  knowsAbout: [
    "Bali Surfing",
    "Canggu Surf Spots",
    "Beach Activities Bali",
    "Pool Party Planning",
    "Balinese Culture",
    "Surf Equipment",
    "Beach Safety",
    "Local Surf Conditions",
  ],
  sameAs: ["https://wa.me/6285190459091"],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "150",
    bestRating: "5",
    worstRating: "1",
  },
};

export default function Home() {
  return (
    <>
      <StructuredData data={organizationSchema} />

      {/* Hero Section */}
      <section className="relative md:min-h-screen flex items-center justify-center overflow-hidden py-20 md:py-0">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-background-mobile.png"
            alt="Summer Party Canggu - Beach Party Equipment"
            fill
            className="object-cover md:hidden"
            priority
            sizes="100vw"
          />
          <Image
            src="/hero-background.png"
            alt="Summer Party Canggu - Beach Party Equipment"
            fill
            className="object-cover hidden md:block"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        <div className="relative z-10 container-custom text-center text-white">
          <h1 className="font-display font-extrabold text-5xl mb-6 drop-shadow-lg md:hidden">
            Your Perfect
            <span className="block text-coral">Summer Party</span>
            Starts Here
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto drop-shadow-md md:mt-20">
            Premium beach and pool essentials in Canggu, Bali. Everything you
            need for unforgettable moments under the sun.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/products"
              className="btn-secondary text-lg px-8 py-4 shadow-lg w-max"
            >
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

      {/* Comprehensive Bali Activities Guide - SEO Content */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">
              Ultimate Bali Beach & Surf Activities Guide
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover the best beach activities, surf spots, and party
              experiences across Bali's most iconic locations. From
              beginner-friendly Canggu beaches to world-class Uluwatu reef
              breaks.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {/* Surf Activities */}
            <div className="bg-gradient-to-br from-teal/10 to-mint/20 rounded-2xl p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-teal rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏄‍♂️</span>
                </div>
                <h3 className="font-display font-bold text-2xl mb-2">
                  Bali Surf Experiences
                </h3>
                <p className="text-gray-600">
                  World-class waves for every skill level
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <h4 className="font-semibold text-lg mb-2 text-teal">
                    Beginner Spots
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Batu Bolong - Perfect learning waves</li>
                    <li>• Echo Beach - Consistent small waves</li>
                    <li>• Berawa Beach - Safe sandy bottom</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-lg mb-2 text-teal">
                    Advanced Breaks
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Uluwatu - World-famous left-hand barrel</li>
                    <li>• Padang Padang - Powerful reef break</li>
                    <li>• Bingin - Technical shallow reef</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  href="/#surfboard-calculator"
                  className="btn-secondary w-full text-center block"
                >
                  Find Your Perfect Board
                </Link>
                <Link
                  href="/areas/canggu"
                  className="text-teal hover:text-teal/80 font-medium text-sm block text-center"
                >
                  Explore Canggu Surf Spots →
                </Link>
              </div>
            </div>

            {/* Beach Activities */}
            <div className="bg-gradient-to-br from-coral/10 to-red/10 rounded-2xl p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-coral rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏖️</span>
                </div>
                <h3 className="font-display font-bold text-2xl mb-2">
                  Beach Activities
                </h3>
                <p className="text-gray-600">Perfect days under the Bali sun</p>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <h4 className="font-semibold text-lg mb-2 text-coral">
                    Popular Activities
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Beach volleyball tournaments</li>
                    <li>• Sunset yoga sessions</li>
                    <li>• Photography workshops</li>
                    <li>• Traditional Balinese ceremonies</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-lg mb-2 text-coral">
                    Equipment Available
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Premium beach umbrellas</li>
                    <li>• Comfortable loungers</li>
                    <li>• Sports equipment</li>
                    <li>• Cooler boxes & refreshments</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  href="/products#beach-essentials"
                  className="btn-primary w-full text-center block"
                >
                  View Beach Equipment
                </Link>
                <Link
                  href="/areas/seminyak"
                  className="text-coral hover:text-red font-medium text-sm block text-center"
                >
                  Discover Seminyak Beaches →
                </Link>
              </div>
            </div>

            {/* Party & Events */}
            <div className="bg-gradient-to-br from-lime/10 to-teal/10 rounded-2xl p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-lime rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎉</span>
                </div>
                <h3 className="font-display font-bold text-2xl mb-2">
                  Party & Events
                </h3>
                <p className="text-gray-600">
                  Unforgettable celebrations in paradise
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <h4 className="font-semibold text-lg mb-2 text-lime">
                    Event Types
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Beach wedding receptions</li>
                    <li>• Birthday pool parties</li>
                    <li>• Corporate team building</li>
                    <li>• Bachelor/bachelorette parties</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-lg mb-2 text-lime">
                    Special Features
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Traditional Balinese Arak</li>
                    <li>• Cultural ceremony elements</li>
                    <li>• Professional photography</li>
                    <li>• Custom party planning</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  href="/products#party-essentials"
                  className="btn-secondary w-full text-center block"
                >
                  Explore Party Packages
                </Link>
                <Link
                  href="/areas/uluwatu"
                  className="text-lime hover:text-lime/80 font-medium text-sm block text-center"
                >
                  Uluwatu Event Venues →
                </Link>
              </div>
            </div>
          </div>

          {/* Bali Locations Overview */}
          <div className="bg-gradient-to-r from-mint/20 to-coral/10 rounded-2xl p-8 mb-16">
            <h3 className="font-display font-bold text-2xl mb-6 text-center">
              🏝️ Explore Bali's Best Activity Locations
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <h4 className="font-semibold text-lg mb-2 text-teal">Canggu</h4>
                <p className="text-sm text-gray-700 mb-3">
                  Surf capital with vibrant beach clubs, perfect for beginners
                  and digital nomads
                </p>
                <Link
                  href="/areas/canggu"
                  className="text-teal hover:text-teal/80 font-medium text-sm"
                >
                  Explore Canggu →
                </Link>
              </div>

              <div className="text-center">
                <h4 className="font-semibold text-lg mb-2 text-coral">
                  Uluwatu
                </h4>
                <p className="text-sm text-gray-700 mb-3">
                  World-class surf breaks and stunning clifftop venues for
                  advanced surfers
                </p>
                <Link
                  href="/areas/uluwatu"
                  className="text-coral hover:text-red font-medium text-sm"
                >
                  Discover Uluwatu →
                </Link>
              </div>

              <div className="text-center">
                <h4 className="font-semibold text-lg mb-2 text-lime">
                  Seminyak
                </h4>
                <p className="text-sm text-gray-700 mb-3">
                  Luxury beach experiences with upscale dining and sophisticated
                  nightlife
                </p>
                <Link
                  href="/areas/seminyak"
                  className="text-lime hover:text-lime/80 font-medium text-sm"
                >
                  Visit Seminyak →
                </Link>
              </div>

              <div className="text-center">
                <h4 className="font-semibold text-lg mb-2 text-teal">Sanur</h4>
                <p className="text-sm text-gray-700 mb-3">
                  Family-friendly beaches with calm waters, perfect for
                  relaxation
                </p>
                <Link
                  href="/areas/sanur"
                  className="text-teal hover:text-teal/80 font-medium text-sm"
                >
                  Explore Sanur →
                </Link>
              </div>
            </div>
          </div>

          {/* SEO-Rich Content Section */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h3 className="font-display font-bold text-2xl mb-6 text-center">
                Why Bali is the Ultimate Beach & Surf Destination
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-gray-700">
                <div>
                  <h4 className="font-semibold text-lg mb-3 text-teal">
                    Perfect Year-Round Conditions
                  </h4>
                  <p className="mb-3">
                    Bali's tropical climate provides ideal conditions for beach
                    activities and surfing throughout the year. The dry season
                    (April-October) offers consistent offshore winds perfect for
                    advanced surfing at spots like Uluwatu and Padang Padang,
                    while the wet season (November-March) provides gentler
                    conditions ideal for beginners at Canggu and Seminyak
                    beaches.
                  </p>
                  <ul className="space-y-1 ml-4">
                    <li>• Average water temperature: 26-28°C (79-82°F)</li>
                    <li>• Consistent swells from Indian Ocean</li>
                    <li>• 300+ days of sunshine annually</li>
                    <li>• Perfect for all water activities</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-lg mb-3 text-coral">
                    World-Class Surf Breaks
                  </h4>
                  <p className="mb-3">
                    From the powerful reef breaks of the Bukit Peninsula to the
                    forgiving beach breaks of Canggu, Bali offers surf spots for
                    every skill level. Our local expertise ensures you get the
                    right equipment and guidance for each unique location.
                  </p>
                  <ul className="space-y-1 ml-4">
                    <li>• 50+ surf breaks around the island</li>
                    <li>• Breaks suitable for all skill levels</li>
                    <li>• Professional surf guide services</li>
                    <li>• Equipment delivery to any location</li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 p-6 bg-mint/10 rounded-lg">
                <h4 className="font-semibold text-lg mb-3 text-center">
                  🌊 Bali Surf & Beach Activity Calendar
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <strong className="text-teal">
                      Peak Season (July-August):
                    </strong>
                    <p>
                      Best conditions for advanced surfers, busy beaches,
                      perfect for events and parties
                    </p>
                  </div>
                  <div>
                    <strong className="text-coral">
                      Shoulder Season (April-June, September-October):
                    </strong>
                    <p>
                      Ideal balance of good conditions and fewer crowds, great
                      for all activities
                    </p>
                  </div>
                  <div>
                    <strong className="text-lime">
                      Low Season (November-March):
                    </strong>
                    <p>
                      Perfect for beginners, budget-friendly, lush landscapes,
                      great for learning
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">
              Why Choose Summer Party Canggu?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We provide premium quality gear for your perfect beach and pool
              experience in Bali
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-mint rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🍉</span>
              </div>
              <h3 className="font-display font-semibold text-xl mb-2">
                Premium Quality
              </h3>
              <p className="text-gray-600">
                Top-grade beach and pool equipment for the ultimate experience
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-coral/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="font-display font-semibold text-xl mb-2">
                Easy WhatsApp Booking
              </h3>
              <p className="text-gray-600">
                Quick and convenient booking through WhatsApp messaging
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-lime/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏖️</span>
              </div>
              <h3 className="font-display font-semibold text-xl mb-2">
                Local Canggu Experts
              </h3>
              <p className="text-gray-600">
                We know the best spots and provide local insights
              </p>
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
          <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">
            Ready for Your Summer Party?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Contact us on WhatsApp now and let's make your Canggu experience
            unforgettable
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
  );
}
