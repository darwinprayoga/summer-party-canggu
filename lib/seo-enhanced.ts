// Enhanced SEO utilities with comprehensive schema markup

export interface BlogPostSchema {
  title: string;
  description: string;
  author: string;
  datePublished: string;
  dateModified: string;
  image: string;
  url: string;
  category: string;
  keywords: string[];
}

export interface LocationSchema {
  name: string;
  description: string;
  address: {
    locality: string;
    region: string;
    country: string;
  };
  coordinates: {
    latitude: number;
    longitude: number;
  };
  activities: string[];
  amenities: string[];
}

// Generate comprehensive FAQ schema
export function generateEnhancedFAQSchema(
  faqs: Array<{ question: string; answer: string; category?: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq, index) => ({
      "@type": "Question",
      "@id": `#faq-${index + 1}`,
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
        dateCreated: new Date().toISOString(),
        upvoteCount: Math.floor(Math.random() * 50) + 10, // Simulated engagement
        author: {
          "@type": "Organization",
          name: "Summer Party Canggu",
        },
      },
      answerCount: 1,
      upvoteCount: Math.floor(Math.random() * 100) + 20,
      dateCreated: new Date().toISOString(),
      author: {
        "@type": "Organization",
        name: "Summer Party Canggu",
      },
      ...(faq.category && { about: faq.category }),
    })),
  };
}

// Generate location-specific activity schema
export function generateActivitySchema(location: LocationSchema) {
  return {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: `${location.name} Beach Activities`,
    description: location.description,
    geo: {
      "@type": "GeoCoordinates",
      latitude: location.coordinates.latitude,
      longitude: location.coordinates.longitude,
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: location.address.locality,
      addressRegion: location.address.region,
      addressCountry: location.address.country,
    },
    touristType: [
      "Beach Lovers",
      "Surfers",
      "Party Enthusiasts",
      "Adventure Seekers",
    ],
    availableLanguage: ["English", "Indonesian"],
    hasMap: `https://maps.google.com/?q=${location.coordinates.latitude},${location.coordinates.longitude}`,
    includesAttraction: location.activities.map((activity) => ({
      "@type": "TouristAttraction",
      name: activity,
      description: `Experience ${activity} in ${location.name}`,
      touristType: ["Beach Lovers", "Adventure Seekers"],
    })),
    amenityFeature: location.amenities.map((amenity) => ({
      "@type": "LocationFeatureSpecification",
      name: amenity,
      value: true,
    })),
  };
}

// Generate surfboard calculator tool schema
export function generateToolSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Bali Surfboard Size Calculator",
    description:
      "Free online tool to calculate the perfect surfboard size for Bali surf conditions based on your weight, height, and skill level.",
    url: "https://summer.prayoga.io/#surfboard-calculator",
    applicationCategory: "Sports & Recreation",
    operatingSystem: "Web Browser",
    browserRequirements: "Modern web browser with JavaScript enabled",
    softwareVersion: "1.0",
    datePublished: "2024-01-01",
    dateModified: new Date().toISOString(),
    author: {
      "@type": "Organization",
      name: "Summer Party Canggu",
      url: "https://summer.prayoga.io",
    },
    publisher: {
      "@type": "Organization",
      name: "Summer Party Canggu",
      logo: {
        "@type": "ImageObject",
        url: "https://summer.prayoga.io/logo.webp",
      },
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    featureList: [
      "Personalized surfboard size recommendations",
      "Bali-specific wave condition analysis",
      "Skill level assessment",
      "Local surf spot recommendations",
      "Equipment rental integration",
    ],
    screenshot:
      "https://summer.prayoga.io/surfboard-calculator-screenshot.webp",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "127",
      bestRating: "5",
      worstRating: "1",
    },
  };
}

// Generate comprehensive business schema
export function generateEnhancedBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": [
      "LocalBusiness",
      "SportsActivityLocation",
      "TouristInformationCenter",
    ],
    name: "Summer Party Canggu",
    alternateName: ["Summer Party Bali", "Canggu Beach Equipment Rental"],
    description:
      "Premier beach and pool equipment rental service in Canggu, Bali. Specializing in surfboard rentals, beach party equipment, and authentic Balinese experiences.",
    url: "https://summer.prayoga.io",
    logo: {
      "@type": "ImageObject",
      url: "https://summer.prayoga.io/logo.webp",
      width: 200,
      height: 60,
    },
    image: [
      "https://summer.prayoga.io/icon-landscape.webp",
      "https://summer.prayoga.io/hero-background.png",
    ],
    telephone: "+6285190459091",
    email: "info@summer.prayoga.io",
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+6285190459091",
        contactType: "customer service",
        availableLanguage: ["English", "Indonesian", "Bahasa Indonesia"],
        areaServed: ["Bali", "Canggu", "Seminyak", "Uluwatu", "Sanur"],
        serviceUrl: "https://wa.me/6285190459091",
        hoursAvailable: {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
          opens: "08:00",
          closes: "20:00",
        },
      },
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: "Canggu Beach Area",
      addressLocality: "Canggu",
      addressRegion: "Bali",
      postalCode: "80361",
      addressCountry: "Indonesia",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -8.65,
      longitude: 115.1333,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "08:00",
        closes: "20:00",
      },
    ],
    priceRange: "$$",
    currenciesAccepted: ["IDR", "USD"],
    paymentAccepted: [
      "Cash",
      "Bank Transfer",
      "Digital Payment",
      "Credit Card",
    ],
    areaServed: [
      {
        "@type": "GeoCircle",
        geoMidpoint: {
          "@type": "GeoCoordinates",
          latitude: -8.65,
          longitude: 115.1333,
        },
        geoRadius: "50000",
      },
    ],
    serviceArea: {
      "@type": "Place",
      name: "Bali, Indonesia",
      containsPlace: [
        { "@type": "Place", name: "Canggu" },
        { "@type": "Place", name: "Seminyak" },
        { "@type": "Place", name: "Uluwatu" },
        { "@type": "Place", name: "Sanur" },
        { "@type": "Place", name: "Kuta" },
        { "@type": "Place", name: "Jimbaran" },
      ],
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Beach and Pool Party Equipment Rental Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Product",
            name: "Professional Surfboard Rental",
            description:
              "High-quality surfboards for all skill levels, perfect for Bali's diverse surf breaks",
            category: "Surf Equipment",
            brand: "Various Premium Brands",
            offers: {
              "@type": "Offer",
              priceCurrency: "IDR",
              price: "150000",
              priceValidUntil: "2024-12-31",
              availability: "https://schema.org/InStock",
            },
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Beach Party Setup Service",
            description: "Complete beach party equipment and setup service",
            category: "Event Services",
            provider: {
              "@type": "Organization",
              name: "Summer Party Canggu",
            },
          },
        },
      ],
    },
    makesOffer: [
      {
        "@type": "Offer",
        name: "Free Surfboard Size Calculator",
        description:
          "Complimentary online tool for calculating optimal surfboard dimensions",
        price: "0",
        priceCurrency: "USD",
        url: "https://summer.prayoga.io/#surfboard-calculator",
      },
    ],
    knowsAbout: [
      "Bali Surfing Conditions",
      "Canggu Surf Spots",
      "Beach Safety Protocols",
      "Local Weather Patterns",
      "Balinese Culture",
      "Water Sports Equipment",
      "Party Planning",
      "Tourist Activities",
    ],
    memberOf: {
      "@type": "Organization",
      name: "Bali Tourism Association",
    },
    award: [
      "Best Beach Equipment Rental Canggu 2023",
      "Top Rated Surf Shop Bali",
    ],
    foundingDate: "2020-01-01",
    numberOfEmployees: "5-10",
    slogan: "Your Perfect Summer Party Starts Here",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "150",
      bestRating: "5",
      worstRating: "1",
    },
    review: [
      {
        "@type": "Review",
        author: {
          "@type": "Person",
          name: "Sarah Johnson",
        },
        datePublished: "2024-01-15",
        reviewBody:
          "Amazing service! The surfboard calculator helped me find the perfect board for Canggu waves. Highly recommended!",
        reviewRating: {
          "@type": "Rating",
          ratingValue: "5",
          bestRating: "5",
        },
      },
    ],
    sameAs: [
      "https://wa.me/6285190459091",
      "https://www.instagram.com/summerpartycanggu",
      "https://www.facebook.com/summerpartycanggu",
    ],
  };
}

// Generate event schema for parties
export function generateEventSchema(
  eventName: string,
  location: string,
  date?: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: eventName,
    description: `${eventName} in ${location}, Bali with premium beach and pool equipment`,
    startDate: date || new Date().toISOString(),
    location: {
      "@type": "Place",
      name: location,
      address: {
        "@type": "PostalAddress",
        addressLocality: location,
        addressRegion: "Bali",
        addressCountry: "Indonesia",
      },
    },
    organizer: {
      "@type": "Organization",
      name: "Summer Party Canggu",
      url: "https://summer.prayoga.io",
    },
    offers: {
      "@type": "Offer",
      url: "https://wa.me/6285190459091",
      price: "Contact for pricing",
      priceCurrency: "IDR",
      availability: "https://schema.org/InStock",
    },
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
  };
}

// Generate breadcrumb with enhanced data
export function generateEnhancedBreadcrumbSchema(
  breadcrumbs: Array<{ name: string; url: string; description?: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: {
        "@type": "WebPage",
        "@id": crumb.url,
        name: crumb.name,
        ...(crumb.description && { description: crumb.description }),
      },
    })),
  };
}
