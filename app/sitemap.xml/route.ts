import { getAllPostSlugs } from "@/lib/wordpress";
import locationSlugs from "@/data/location-slugs.json";

interface SitemapEntry {
  url: string;
  lastModified: string;
  changeFrequency:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority: number;
}

function generateSitemapXML(entries: SitemapEntry[]): string {
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
  const urlsetOpen =
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
  const urlsetClose = "</urlset>";

  const urls = entries
    .map(
      (entry) => `
  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastModified}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`,
    )
    .join("");

  return `${xmlHeader}\n${urlsetOpen}${urls}\n${urlsetClose}`;
}

export async function GET() {
  const baseUrl = "https://summer.prayoga.io";
  const currentDate = new Date().toISOString();

  try {
    // Static pages with high priority
    const staticPages: SitemapEntry[] = [
      {
        url: baseUrl,
        lastModified: currentDate,
        changeFrequency: "weekly",
        priority: 1.0,
      },
      {
        url: `${baseUrl}/products`,
        lastModified: currentDate,
        changeFrequency: "weekly",
        priority: 0.9,
      },
      {
        url: `${baseUrl}/blog`,
        lastModified: currentDate,
        changeFrequency: "daily",
        priority: 0.8,
      },
      {
        url: `${baseUrl}/areas`,
        lastModified: currentDate,
        changeFrequency: "monthly",
        priority: 0.7,
      },
    ];

    // Dynamic blog posts
    let blogPostEntries: SitemapEntry[] = [];
    try {
      const postSlugs = await getAllPostSlugs();
      blogPostEntries = postSlugs.map((slug) => ({
        url: `${baseUrl}/blog/${slug}`,
        lastModified: currentDate,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      }));
    } catch (error) {
      console.error("Error fetching blog posts for sitemap:", error);
      // Continue without blog posts if there's an error
    }

    // All location pages
    const locationEntries: SitemapEntry[] = locationSlugs.map((slug) => ({
      url: `${baseUrl}/areas/${slug}`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.5,
    }));

    // Product category pages (if they exist)
    const productCategoryEntries: SitemapEntry[] = [
      {
        url: `${baseUrl}/products#beach-essentials`,
        lastModified: currentDate,
        changeFrequency: "weekly",
        priority: 0.4,
      },
      {
        url: `${baseUrl}/products#pool-day-gear`,
        lastModified: currentDate,
        changeFrequency: "weekly",
        priority: 0.4,
      },
    ];

    // Blog category pages (dynamic based on available categories)
    const blogCategoryEntries: SitemapEntry[] = [
      "Beach Guide",
      "Party Tips",
      "Surfing",
      "General",
    ].map((category) => ({
      url: `${baseUrl}/blog?category=${encodeURIComponent(category)}`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.3,
    }));

    // Combine all entries
    const allEntries = [
      ...staticPages,
      ...blogPostEntries,
      ...locationEntries,
      ...productCategoryEntries,
      ...blogCategoryEntries,
    ];

    // Sort by priority (highest first) then by URL
    allEntries.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return a.url.localeCompare(b.url);
    });

    const sitemapXML = generateSitemapXML(allEntries);

    return new Response(sitemapXML, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);

    // Return a minimal sitemap with just static pages if there's an error
    const minimalEntries: SitemapEntry[] = [
      {
        url: baseUrl,
        lastModified: currentDate,
        changeFrequency: "weekly",
        priority: 1.0,
      },
      {
        url: `${baseUrl}/products`,
        lastModified: currentDate,
        changeFrequency: "weekly",
        priority: 0.9,
      },
      {
        url: `${baseUrl}/blog`,
        lastModified: currentDate,
        changeFrequency: "daily",
        priority: 0.8,
      },
      {
        url: `${baseUrl}/areas`,
        lastModified: currentDate,
        changeFrequency: "monthly",
        priority: 0.7,
      },
    ];

    const minimalSitemap = generateSitemapXML(minimalEntries);

    return new Response(minimalSitemap, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=1800, s-maxage=1800", // Cache for 30 minutes on error
      },
    });
  }
}

// Optional: Add HEAD method for better SEO
export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
