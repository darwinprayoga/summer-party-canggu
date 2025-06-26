import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import StructuredData from "../../components/StructuredData"
import { generateLocalBusinessSchema, generateBreadcrumbSchema, generateServiceSchema } from "@/lib/seo-utils"
import locations from "@/data/locations.json"

interface LocationData {
  slug: string
  name: string
  region: string
  description: string
  highlights: string[]
  attractions: string[]
  beachType?: string
  surfSpots?: string[]
  keywords: string[]
  image: string
  nearbyLocations: string[]
  specialties: string[]
}

// Add this component to handle search params
function LocationContent({ params }: { params: { location: string } }) {
  // ... existing component code stays the same
}

// Add this component to show activity-specific information
function ActivityBanner({ searchParams }: { searchParams: { activity?: string; time?: string } }) {
  if (!searchParams.activity) return null

  const activityEmojis: Record<string, string> = {
    surfing: "🏄‍♂️",
    snorkeling: "🤿",
    party: "🎉",
    relaxing: "🏖️",
    photography: "📸",
    cultural: "🏛️",
  }

  return (
    <div className="bg-gradient-to-r from-coral to-teal text-white p-4 rounded-lg mb-8">
      <div className="flex items-center">
        <span className="text-2xl mr-3">{activityEmojis[searchParams.activity] || "🎯"}</span>
        <div>
          <h3 className="font-semibold text-lg">
            Perfect for {searchParams.activity.charAt(0).toUpperCase() + searchParams.activity.slice(1)}!
          </h3>
          {searchParams.time && (
            <p className="text-white/90">Recommended time: {decodeURIComponent(searchParams.time)}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export async function generateStaticParams() {
  return locations.map((location) => ({
    location: location.slug,
  }))
}

export async function generateMetadata({ params }: { params: { location: string } }): Promise<Metadata> {
  const location = locations.find((loc) => loc.slug === params.location)

  if (!location) {
    return {
      title: "Location Not Found",
    }
  }

  return {
    title: `${location.name} Beach & Pool Party Equipment | Summer Party Canggu`,
    description: `Premium beach and pool party equipment in ${location.name}, ${location.region}. ${location.description}`,
    keywords: [
      ...location.keywords,
      `${location.name} beach party`,
      `${location.name} pool party`,
      `events ${location.name}`,
    ],
    openGraph: {
      title: `${location.name} Beach & Pool Party Equipment`,
      description: `Premium beach and pool party equipment in ${location.name}, ${location.region}. ${location.description}`,
      type: "website",
      images: [
        {
          url: "/icon-landscape.webp",
          width: 1200,
          height: 630,
          alt: `${location.name} beach and pool party location`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${location.name} Beach & Pool Party Equipment`,
      description: `Premium beach and pool party equipment in ${location.name}, ${location.region}`,
      images: ["/icon-landscape.webp"],
    },
    alternates: {
      canonical: `https://summerpartycanggu.com/areas/${params.location}`,
    },
  }
}

export default function LocationPage({
  params,
  searchParams,
}: {
  params: { location: string }
  searchParams: { activity?: string; time?: string }
}) {
  const location = locations.find((loc) => loc.slug === params.location)

  if (!location) {
    notFound()
  }

  // Generate structured data
  const localBusinessSchema = generateLocalBusinessSchema(location.name)
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://summerpartycanggu.com" },
    { name: "Our Areas", url: "https://summerpartycanggu.com/areas" },
    { name: location.name, url: `https://summerpartycanggu.com/areas/${location.slug}` },
  ])
  const serviceSchema = generateServiceSchema(
    `Beach & Pool Party Equipment in ${location.name}`,
    `Premium beach and pool party equipment rental services in ${location.name}, ${location.region}`,
    location.name,
  )

  return (
    <>
      <StructuredData data={localBusinessSchema} />
      <StructuredData data={breadcrumbSchema} />
      <StructuredData data={serviceSchema} />

      <div className="section-padding">
        <div className="container-custom">
          {/* Breadcrumb */}
          <div className="mb-8">
            <nav className="flex items-center space-x-2 text-sm text-gray-600">
              <Link href="/" className="hover:text-teal transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link href="/areas" className="hover:text-teal transition-colors">
                Our Areas
              </Link>
              <span>/</span>
              <span className="text-charcoal font-medium">{location.name}</span>
            </nav>
          </div>

          {/* Activity Banner */}
          <ActivityBanner searchParams={searchParams} />

          {/* Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h1 className="font-display font-bold text-4xl md:text-5xl mb-4">
                Beach & Pool Party Equipment in <span className="text-teal">{location.name}</span>
              </h1>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">{location.description}</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={`https://wa.me/6285190459091?text=Hi! I'm interested in beach and pool party equipment in ${location.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  Get Quote for {location.name}
                </a>
                <Link href="/products" className="btn-secondary">
                  View Our Equipment
                </Link>
              </div>
            </div>

            <div>
              <Image
                src={location.image || "/placeholder.svg?height=400&width=600"}
                alt={`${location.name} beach and pool party location`}
                width={600}
                height={400}
                className="w-full rounded-lg shadow-lg"
                priority
              />
            </div>
          </div>

          {/* Location Highlights */}
          <section className="mb-16">
            <h2 className="font-display font-bold text-3xl mb-8 text-center">
              Why Choose {location.name} for Your Event?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {location.highlights.map((highlight, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="w-12 h-12 bg-mint rounded-full flex items-center justify-center mb-4">
                    <span className="text-teal font-bold text-xl">✓</span>
                  </div>
                  <p className="text-gray-700 font-medium">{highlight}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Attractions & Features */}
          <section className="mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <h3 className="font-display font-bold text-2xl mb-6 text-coral">
                  Popular Attractions in {location.name}
                </h3>
                <ul className="space-y-3">
                  {location.attractions.map((attraction, index) => (
                    <li key={index} className="flex items-center text-gray-700">
                      <span className="w-2 h-2 bg-coral rounded-full mr-3 flex-shrink-0"></span>
                      {attraction}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-display font-bold text-2xl mb-6 text-teal">Our Specialties in {location.name}</h3>
                <ul className="space-y-3">
                  {location.specialties.map((specialty, index) => (
                    <li key={index} className="flex items-center text-gray-700">
                      <span className="w-2 h-2 bg-teal rounded-full mr-3 flex-shrink-0"></span>
                      {specialty}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Beach/Surf Information */}
          {location.beachType && (
            <section className="mb-16 bg-mint/10 rounded-2xl p-8">
              <h3 className="font-display font-bold text-2xl mb-4 text-center">Beach Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-lg mb-2 text-teal">Beach Type</h4>
                  <p className="text-gray-700">{location.beachType}</p>
                </div>
                {location.surfSpots && (
                  <div>
                    <h4 className="font-semibold text-lg mb-2 text-coral">Surf Spots</h4>
                    <ul className="space-y-1">
                      {location.surfSpots.map((spot, index) => (
                        <li key={index} className="text-gray-700">
                          • {spot}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Nearby Locations */}
          <section className="mb-16">
            <h3 className="font-display font-bold text-2xl mb-6 text-center">We Also Serve Nearby Areas</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {location.nearbyLocations.map((nearby, index) => (
                <Link
                  key={index}
                  href={`/areas/${nearby.toLowerCase().replace(/\s+/g, "-").replace(/\//g, "-")}`}
                  className="bg-white border border-mint hover:bg-mint hover:text-teal transition-colors px-4 py-2 rounded-full text-sm font-medium"
                >
                  {nearby}
                </Link>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-gradient-to-r from-teal to-coral rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 className="font-display font-bold text-3xl mb-4">Ready to Party in {location.name}?</h2>
            <p className="text-lg mb-6 max-w-2xl mx-auto">
              Contact us now to discuss your beach or pool party needs in {location.name}. We'll help you create the
              perfect celebration with our premium equipment and local expertise.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={`https://wa.me/6285190459091?text=Hi! I want to plan a party in ${location.name}. Can you help me with equipment and setup?`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-white text-teal font-semibold py-3 px-8 rounded-full hover:bg-gray-100 transition-colors"
              >
                WhatsApp Us Now
              </a>
              <Link
                href="/products"
                className="inline-block border-2 border-white text-white font-semibold py-3 px-8 rounded-full hover:bg-white hover:text-teal transition-colors"
              >
                View Equipment
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
