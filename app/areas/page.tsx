import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import LocationMap from "../components/LocationMap"

import locationSlugs from "@/data/location-slugs.json"

export const metadata: Metadata = {
  title: "Our Areas - Popular Locations in Canggu & Bali",
  description:
    "Discover the best areas in Canggu and Bali for beach parties and pool days. From Echo Beach to Seminyak, we serve all popular locations.",
  keywords: ["Canggu areas", "Echo Beach", "Berawa", "Seminyak", "Bali beach locations", "pool party venues"],
}

export default function AreasPage() {
  return (
    <div className="section-padding">
      <div className="container-custom">
      
        {/* Location Map */}
        <LocationMap
          title="Where We Deliver in Bali"
          description="Explore our service coverage across Bali's most popular beach destinations and party spots"
          className="!py-0 mb-16"
        />

        {/* All Locations Grid */}
        <section className="mt-20">
          <h2 className="font-display font-bold text-3xl mb-8 text-center">All Our Service Locations</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            We provide premium beach and pool party equipment across Bali, Lombok, and the Gili Islands. Click on any
            location to learn more about our services in that area.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {locationSlugs.map((location) => (
              <Link
                key={location}
                href={`/areas/${location.toLowerCase().replace(/\s+/g, "-").replace(/\//g, "-")}`}
                className="bg-white border border-gray-200 hover:border-teal hover:shadow-md transition-all duration-200 p-4 rounded-lg text-center group"
              >
                <span className="text-sm font-medium text-gray-700 group-hover:text-teal transition-colors">
                  {location}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Service Coverage CTA */}
        <section className="mt-20 bg-gradient-to-r from-mint to-teal/20 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="font-display font-bold text-3xl mb-4 text-charcoal">Don't See Your Area?</h2>
          <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
            We're expanding our service areas across Bali. Contact us to check if we can deliver to your location for
            your special event.
          </p>
          <a
            href="https://wa.me/6285190459091?text=Hi! I'd like to check if you deliver to my area in Bali"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            Check Service Availability
          </a>
        </section>
      </div>
    </div>
  )
}
