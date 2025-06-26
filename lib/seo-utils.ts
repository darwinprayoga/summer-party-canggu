// SEO utility functions for better search engine optimization

export interface SitemapEntry {
  url: string
  lastModified: string
  changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never"
  priority: number
}

// Generate structured data for local business
export function generateLocalBusinessSchema(location?: string) {
  const baseSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Summer Party Canggu",
    description: "Premium beach and pool party equipment rental in Canggu, Bali",
    url: "https://summerpartycanggu.com",
    telephone: "+6285190459091",
    email: "info@summerpartycanggu.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: location || "Canggu",
      addressRegion: "Bali",
      addressCountry: "Indonesia",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "-8.6500",
      longitude: "115.1333",
    },
    openingHours: "Mo-Su 08:00-20:00",
    priceRange: "$$",
    servesCuisine: [],
    serviceArea: {
      "@type": "Place",
      name: "Bali, Indonesia",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Beach and Pool Party Equipment",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Product",
            name: "Beach Party Equipment",
            description: "Complete beach party setup including umbrellas, chairs, and games",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Product",
            name: "Pool Party Equipment",
            description: "Pool floats, games, and party accessories for the perfect pool day",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Product",
            name: "Surfboard Rental",
            description: "Professional surfboards for all skill levels",
          },
        },
      ],
    },
    sameAs: [
      "https://wa.me/6285190459091",
      // Add social media links when available
    ],
  }

  return baseSchema
}

// Generate breadcrumb structured data
export function generateBreadcrumbSchema(breadcrumbs: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  }
}

// Generate FAQ structured data
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }
}

// Generate service structured data
export function generateServiceSchema(serviceName: string, description: string, location: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: serviceName,
    description: description,
    provider: {
      "@type": "LocalBusiness",
      name: "Summer Party Canggu",
      address: {
        "@type": "PostalAddress",
        addressLocality: location,
        addressRegion: "Bali",
        addressCountry: "Indonesia",
      },
    },
    areaServed: {
      "@type": "Place",
      name: location,
    },
    serviceType: "Equipment Rental",
    category: "Beach and Pool Party Equipment",
  }
}

// Validate and clean URLs for sitemap
export function validateSitemapUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Generate canonical URL
export function generateCanonicalUrl(path: string): string {
  const baseUrl = "https://summerpartycanggu.com"
  const cleanPath = path.startsWith("/") ? path : `/${path}`
  return `${baseUrl}${cleanPath}`
}

// Extract keywords from content
export function extractKeywords(content: string, maxKeywords = 10): string[] {
  const commonWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "can",
    "this",
    "that",
    "these",
    "those",
  ])

  const words = content
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3 && !commonWords.has(word))

  const wordCount = words.reduce(
    (acc, word) => {
      acc[word] = (acc[word] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return Object.entries(wordCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, maxKeywords)
    .map(([word]) => word)
}
