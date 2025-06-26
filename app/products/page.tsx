import type { Metadata } from "next"
import Image from "next/image"
import StructuredData from "../components/StructuredData"
import products from "@/data/products.json"

export const metadata: Metadata = {
  title: "Our Products - Beach & Pool Essentials",
  description:
    "Discover our premium collection of beach essentials and pool day gear in Canggu, Bali. Surfboards, floaties, cooler boxes and more.",
}

interface Product {
  id: string
  name: string
  description: string
  category: "beach-essentials" | "pool-day-gear" | "party-essentials"
  image: string
  slug: string
  isNew?: boolean
  isSpecial?: boolean
}

const productSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: products.map((product, index) => ({
    "@type": "Product",
    position: index + 1,
    name: product.name,
    description: product.description,
    url: `https://summerpartycanggu.com/products/${product.slug}`,
  })),
}

export default function ProductsPage() {
  const beachEssentials = products.filter((p) => p.category === "beach-essentials")
  const poolDayGear = products.filter((p) => p.category === "pool-day-gear")
  const partyEssentials = products.filter((p) => p.category === "party-essentials")

  const ProductCard = ({ product }: { product: Product }) => (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow relative">
      {product.isNew && (
        <div className="absolute top-4 left-4 z-10">
          <span className="bg-coral text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">NEW</span>
        </div>
      )}
      {product.isSpecial && (
        <div className="absolute top-4 right-4 z-10">
          <span className="bg-gradient-to-r from-lime to-teal text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
            ⭐ SPECIAL
          </span>
        </div>
      )}
      <Image
        src={product.image || "/placeholder.svg"}
        alt={product.name}
        width={400}
        height={300}
        className="w-full h-48 object-cover"
      />
      <div className="p-6">
        <h3 className="font-display font-semibold text-xl mb-2">{product.name}</h3>
        <p className="text-gray-600 mb-4">{product.description}</p>
        <a
          href={`https://wa.me/6285190459091?text=Hi! I'm interested in ${product.name}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary w-full text-center"
        >
          Inquire on WhatsApp
        </a>
      </div>
    </div>
  )

  return (
    <>
      <StructuredData data={productSchema} />

      <div className="section-padding">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h1 className="font-display font-bold text-4xl md:text-5xl mb-4">Our Products</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Premium beach and pool essentials for your perfect Canggu experience
            </p>
          </div>

          {/* Party Essentials - Featured Section */}
          {partyEssentials.length > 0 && (
            <section id="party-essentials" className="mb-16">
              <div className="bg-gradient-to-r from-coral/10 to-lime/10 rounded-2xl p-8 mb-8">
                <div className="text-center mb-8">
                  <h2 className="font-display font-bold text-3xl mb-4 text-coral">🎉 Party Essentials - NEW!</h2>
                  <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                    Authentic Balinese experiences to make your party truly special and memorable
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
                  {partyEssentials.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Beach Essentials */}
          <section id="beach-essentials" className="mb-16">
            <h2 className="font-display font-bold text-3xl mb-8 text-teal">Beach Essentials</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {beachEssentials.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>

          {/* Pool Day Gear */}
          <section id="pool-day-gear">
            <h2 className="font-display font-bold text-3xl mb-8 text-coral">Pool Day Gear</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {poolDayGear.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>

          {/* Special Notice for Arak */}
          <div className="mt-16 bg-gradient-to-r from-teal/10 to-coral/10 rounded-2xl p-8 text-center">
            <h3 className="font-display font-bold text-2xl mb-4">🍶 Experience Authentic Bali</h3>
            <p className="text-lg text-gray-700 mb-6 max-w-3xl mx-auto">
              Our Balinese Arak offers you a taste of authentic local culture. This traditional rice wine is perfect for
              special celebrations and cultural experiences. Must be 21+ and consumed responsibly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://wa.me/6285190459091?text=Hi! I'm interested in learning more about Balinese Arak for my party"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                Learn More About Arak
              </a>
              <a
                href="https://wa.me/6285190459091?text=Hi! I'd like to plan a cultural party experience with traditional elements"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                Plan Cultural Experience
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
