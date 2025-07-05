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
function ActivityBanner({
  searchParams,
}: {
  searchParams: { activity?: string; time?: string }
}) {
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

// Function to generate Google Maps URL for a location
function getGoogleMapsUrl(locationName: string, region: string): string {
  const query = encodeURIComponent(`${locationName}, ${region}, Indonesia`)
  return `https://www.google.com/maps/search/?api=1&query=${query}`
}

export async function generateStaticParams() {
  return locations.map((location) => ({
    location: location.slug,
  }))
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { location: string }
  searchParams: { activity?: string; time?: string }
}): Promise<Metadata> {
  const location = locations.find((loc) => loc.slug === params.location)

  if (!location) {
    return {
      title: "Location Not Found",
    }
  }

  const activitySuffix = searchParams.activity ? ` - Perfect for ${searchParams.activity}` : ""
  const baseTitle = `${location.name} Beach & Pool Party Equipment | Bali Activities${activitySuffix}`
  const baseDescription = `Premium beach and pool party equipment in ${location.name}, ${location.region}. ${
    location.description
  } Best activities: ${location.highlights.slice(0, 3).join(", ")}.`

  return {
    title: baseTitle,
    description: baseDescription,
    keywords: [
      ...location.keywords,
      `${location.name} beach party`,
      `${location.name} pool party`,
      `${location.name} activities`,
      `${location.name} surf spots`,
      `events ${location.name}`,
      `Bali ${location.name}`,
      `${location.region} activities`,
      "Bali beach equipment",
      "Bali surf rental",
      "Canggu party equipment",
    ],
    openGraph: {
      title: baseTitle,
      description: baseDescription,
      type: "website",
      images: [
        {
          url: "/icon-landscape.webp",
          width: 1200,
          height: 630,
          alt: `${location.name} beach and pool party activities in Bali`,
        },
      ],
      siteName: "Summer Party Canggu",
    },
    twitter: {
      card: "summary_large_image",
      title: baseTitle,
      description: baseDescription,
      images: ["/icon-landscape.webp"],
    },
    alternates: {
      canonical: `https://summer.prayoga.io/areas/${params.location}`,
    },
    other: {
      "geo.region": "ID-BA",
      "geo.placename": `${location.name}, Bali`,
      "geo.position": location.name === "Canggu" ? "-8.6500;115.1333" : "-8.6500;115.1333",
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
    { name: "Home", url: "https://summer.prayoga.io" },
    { name: "Our Areas", url: "https://summer.prayoga.io/areas" },
    {
      name: location.name,
      url: `https://summer.prayoga.io/areas/${location.slug}`,
    },
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
                  href={getGoogleMapsUrl(location.name, location.region)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary inline-flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  Visit on the map
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

          {/* Comprehensive Location Guide - SEO Content */}
          <section className="mb-16">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="font-display font-bold text-3xl mb-8 text-center">
                Complete {location.name} Activity Guide
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div>
                  <h3 className="font-display font-semibold text-xl mb-4 text-teal">🏄‍♂️ Surf Activities</h3>
                  <div className="space-y-3 text-sm text-gray-700">
                    <p>
                      <strong>{location.name}</strong> offers world-class surfing opportunities for all skill levels.
                      {location.surfSpots ? (
                        <>
                          The area features renowned surf breaks including{" "}
                          {location.surfSpots.slice(0, 2).join(" and ")}.
                        </>
                      ) : (
                        <>Perfect waves for beginners and experienced surfers alike.</>
                      )}
                    </p>
                    <ul className="space-y-1 ml-4">
                      <li>• Professional surfboard rentals (all sizes)</li>
                      <li>• Local surf guide services</li>
                      <li>• Surf lessons for beginners</li>
                      <li>• Equipment delivery to beach</li>
                    </ul>
                    <Link
                      href="/#surfboard-calculator"
                      className="inline-block text-teal hover:text-teal/80 font-medium text-sm"
                    >
                      → Use our Surfboard Size Calculator
                    </Link>
                  </div>
                </div>

                <div>
                  <h3 className="font-display font-semibold text-xl mb-4 text-coral">🏖️ Beach Activities</h3>
                  <div className="space-y-3 text-sm text-gray-700">
                    <p>
                      Transform your {location.name} beach day with our premium equipment. From sunrise yoga sessions to
                      sunset beach parties, we have everything you need.
                    </p>
                    <ul className="space-y-1 ml-4">
                      <li>• Beach umbrellas and comfortable seating</li>
                      <li>• Volleyball and beach games equipment</li>
                      <li>• Cooler boxes and refreshment setup</li>
                      <li>• Photography props and accessories</li>
                    </ul>
                    <Link
                      href="/products#beach-essentials"
                      className="inline-block text-coral hover:text-red font-medium text-sm"
                    >
                      → View Beach Equipment
                    </Link>
                  </div>
                </div>

                <div>
                  <h3 className="font-display font-semibold text-xl mb-4 text-lime">🎉 Party & Events</h3>
                  <div className="space-y-3 text-sm text-gray-700">
                    <p>
                      Host unforgettable celebrations in {location.name} with our party essentials. Perfect for
                      birthdays, bachelor/bachelorette parties, and group celebrations.
                    </p>
                    <ul className="space-y-1 ml-4">
                      <li>• Pool floats and party decorations</li>
                      <li>• Sound systems and lighting</li>
                      <li>• Traditional Balinese party elements</li>
                      <li>• Custom party planning services</li>
                    </ul>
                    <Link
                      href="/products#party-essentials"
                      className="inline-block text-lime hover:text-lime/80 font-medium text-sm"
                    >
                      → Explore Party Packages
                    </Link>
                  </div>
                </div>
              </div>

              {/* Local Insights Section */}
              <div className="border-t border-gray-200 pt-8">
                <h3 className="font-display font-semibold text-2xl mb-6 text-center">
                  Local Insider Tips for {location.name}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-mint/10 rounded-lg p-6">
                    <h4 className="font-semibold text-lg mb-3 text-teal">🌅 Best Times to Visit</h4>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p>
                        <strong>Sunrise (6:00-8:00 AM):</strong> Perfect for photography, yoga, and peaceful beach walks
                      </p>
                      <p>
                        <strong>Morning (8:00-11:00 AM):</strong> Ideal surf conditions, less crowded beaches
                      </p>
                      <p>
                        <strong>Afternoon (2:00-5:00 PM):</strong> Great for pool parties and beach games
                      </p>
                      <p>
                        <strong>Sunset (5:00-7:00 PM):</strong> Magical golden hour for celebrations
                      </p>
                    </div>
                  </div>

                  <div className="bg-coral/10 rounded-lg p-6">
                    <h4 className="font-semibold text-lg mb-3 text-coral">🍽️ Local Recommendations</h4>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p>
                        <strong>Must-try Food:</strong> Fresh seafood, traditional Balinese cuisine, tropical fruits
                      </p>
                      <p>
                        <strong>Beach Cafes:</strong> Perfect spots for post-surf meals and refreshments
                      </p>
                      <p>
                        <strong>Local Markets:</strong> Authentic shopping experiences and cultural immersion
                      </p>
                      <p>
                        <strong>Wellness:</strong> Spa treatments, yoga classes, and meditation sessions
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weather and Seasonal Information */}
              <div className="mt-8 p-6 bg-gradient-to-r from-teal/10 to-coral/10 rounded-lg">
                <h4 className="font-display font-semibold text-lg mb-4 text-center">
                  🌤️ {location.name} Weather & Seasonal Guide
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <h5 className="font-semibold mb-2 text-teal">Dry Season (April - October)</h5>
                    <ul className="space-y-1 text-gray-700">
                      <li>• Perfect weather for all outdoor activities</li>
                      <li>• Consistent surf conditions</li>
                      <li>• Ideal for beach parties and events</li>
                      <li>• Lower humidity, comfortable temperatures</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-semibold mb-2 text-coral">Wet Season (November - March)</h5>
                    <ul className="space-y-1 text-gray-700">
                      <li>• Great for beginners learning to surf</li>
                      <li>• Lush green landscapes, fewer crowds</li>
                      <li>• Perfect for covered pool parties</li>
                      <li>• Warm tropical showers, quick to clear</li>
                    </ul>
                  </div>
                </div>
              </div>
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
