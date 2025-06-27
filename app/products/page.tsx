import type { Metadata } from "next";
import Image from "next/image";
import StructuredData from "../components/StructuredData";
import products from "@/data/products.json";

export const metadata: Metadata = {
  title:
    "Pool Day Gear, Surfboards & Beach Essentials - Canggu Bali | Summer Party Canggu",
  description:
    "Rent premium pool floats, buy second-hand surfboards, and get authentic Balinese Arak in Canggu, Bali. Perfect for villa pool parties and beach days. Ice included with coolers!",
  keywords:
    "pool floats Canggu, second hand surfboards Bali, Balinese Arak, beach gear Bali, pool party equipment, villa accessories Canggu, cooler box rental Bali, surfboard marketplace Canggu",
  openGraph: {
    title: "Pool Day Gear, Surfboards & Beach Essentials - Canggu Bali",
    description:
      "Premium pool floats, second-hand surfboards & authentic Balinese Arak in Canggu. Perfect for villa pool parties!",
    images: ["/products/adult-gray-float.png"],
  },
};

const productSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: metadata.title,
  description: metadata.description,
  itemListElement: products.map((product, index) => ({
    "@type": "Product",
    position: index + 1,
    name: product.name,
    description: product.description,
    image: product.image.startsWith("/products/")
      ? `https://summerpartycanggu.com${product.image}`
      : product.image,
    offers: {
      "@type": "Offer",
      price: product.price.includes("Ask")
        ? "Contact for pricing"
        : product.price,
      priceCurrency: "IDR",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "Summer Party Canggu",
      },
    },
    url: `https://summerpartycanggu.com/products/${product.slug}`,
  })),
};

export default function ProductsPage() {
  const beachEssentials = products.filter(
    (p) => p.category === "beach-essentials",
  );
  const poolDayGear = products.filter((p) => p.category === "pool-day-gear");
  const partyEssentials = products.filter(
    (p) => p.category === "party-essentials",
  );

  const ProductCard = ({ product }: { product: any }) => {
    const isCustomPricing = product.price.includes("Ask");
    const whatsappMessage = isCustomPricing
      ? `Hi! I'm interested in ${product.name}. Can you tell me about pricing and availability?`
      : `Hi! I'm interested in renting ${product.name} (${product.price})`;

    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 relative group">
        {product.isNew && (
          <div className="absolute top-4 left-4 z-10">
            <span className="bg-coral text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
              NEW
            </span>
          </div>
        )}
        {product.isSpecial && (
          <div className="absolute top-4 right-4 z-10">
            <span className="bg-gradient-to-r from-lime to-teal text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              ⭐ SPECIAL
            </span>
          </div>
        )}
        <div className="relative overflow-hidden">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            width={400}
            height={300}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="p-6">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-display font-semibold text-lg text-gray-900">
              {product.name}
            </h3>
            <span
              className={`font-bold text-sm whitespace-nowrap ml-2 ${
                isCustomPricing ? "text-teal" : "text-coral"
              }`}
            >
              {product.price}
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-3 leading-snug">
            {product.description}
          </p>

          {product.features && (
            <ul className="text-xs text-gray-500 space-y-1 mb-4">
              {product.features
                .slice(0, 3)
                .map((feature: any, index: number) => (
                  <li key={index} className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-teal rounded-full mr-2"></span>
                    {feature}
                  </li>
                ))}
            </ul>
          )}

          <a
            href={`https://wa.me/6285190459091?text=${encodeURIComponent(
              whatsappMessage,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full text-center group-hover:bg-coral-dark transition-colors duration-300"
          >
            {isCustomPricing ? "Ask for Price" : `Rent Now - ${product.price}`}
          </a>
        </div>
      </div>
    );
  };

  return (
    <>
      <StructuredData data={productSchema} />

      <div className="section-padding">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h1 className="font-display font-bold text-4xl md:text-5xl mb-4 bg-gradient-to-r from-teal to-coral bg-clip-text text-transparent">
              Pool Day Gear, Surfboards & Beach Essentials
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Premium pool floats, quality second-hand surfboards, authentic
              Balinese Arak, and beach gear for your perfect Canggu experience.
              Ice included with all cooler rentals!
            </p>
          </div>

          {/* Party Essentials - Featured Section */}
          {partyEssentials.length > 0 && (
            <section id="party-essentials" className="mb-16">
              <div className="bg-gradient-to-r from-coral/10 to-lime/10 rounded-2xl p-8">
                <div className="text-center mb-8">
                  <h2 className="font-display font-bold text-3xl mb-4 text-coral">
                    🎉 Party Essentials - NEW!
                  </h2>
                  <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                    Authentic Balinese experiences with our exclusive Summer
                    Party Canggu branded Arak
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                  {partyEssentials.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Pool Day Gear */}
          <section id="pool-day-gear" className="mb-16">
            <h2 className="font-display font-bold text-3xl mb-8 text-teal">
              🏊‍♀️ Pool Day Essentials
            </h2>
            <p className="text-lg text-gray-600 mb-8 text-center max-w-2xl mx-auto">
              Transform your villa pool into the ultimate relaxation paradise
              with our premium pool gear
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {poolDayGear.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>

          {/* Beach Essentials - Featured Section */}
          <section id="beach-essentials" className="mb-16">
            <h2 className="font-display font-bold text-3xl mb-4 text-coral">
              🏄‍♂️ Beach Essentials & Surfboards
            </h2>
            <p className="text-lg text-gray-600 mb-8 text-center max-w-2xl mx-auto">
              Quality second-hand surfboards and beach essentials for your
              Canggu surf adventures
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {beachEssentials.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>

          {/* Why Choose Our Products */}
          <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="font-display font-bold text-2xl mb-6 text-center">
              🌟 Why Choose Summer Party Canggu?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🧊</span>
                </div>
                <h4 className="font-semibold text-lg mb-2">Ice Included</h4>
                <p className="text-gray-600">
                  All cooler rentals come with fresh ice to keep your drinks
                  perfectly chilled
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-coral/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🚚</span>
                </div>
                <h4 className="font-semibold text-lg mb-2">Free Delivery</h4>
                <p className="text-gray-600">
                  We deliver directly to your villa in Canggu area at no extra
                  cost
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-lime/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏄‍♂️</span>
                </div>
                <h4 className="font-semibold text-lg mb-2">
                  Quality Surfboards
                </h4>
                <p className="text-gray-600">
                  Carefully selected second-hand boards perfect for all skill
                  levels
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-coral/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🍶</span>
                </div>
                <h4 className="font-semibold text-lg mb-2">Authentic Arak</h4>
                <p className="text-gray-600">
                  Traditional Balinese rice wine with exclusive Summer Party
                  branding
                </p>
              </div>
            </div>
          </div>

          {/* Special Notice */}
          <div className="mt-16 bg-gradient-to-r from-teal/10 to-coral/10 rounded-2xl p-8 text-center">
            <h3 className="font-display font-bold text-2xl mb-4">
              🏝️ Complete Your Canggu Experience
            </h3>
            <p className="text-lg text-gray-700 mb-6 max-w-3xl mx-auto">
              From surfing the perfect waves with our quality second-hand boards
              to relaxing by the pool with premium floats, and celebrating with
              authentic Balinese Arak - we've got everything for your ultimate
              Canggu adventure!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://wa.me/6285190459091?text=Hi! I'm interested in learning more about your surfboards and pricing"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                Ask About Surfboards
              </a>
              <a
                href="https://wa.me/6285190459091?text=Hi! I'd like to plan a complete pool party experience with all your gear"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                Plan Complete Experience
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
