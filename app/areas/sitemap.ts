import type { MetadataRoute } from "next";
import locationSlugs from "@/data/location-slugs.json";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://summer.prayoga.io";

  return locationSlugs.map((location) => ({
    url: `${baseUrl}/areas/${location}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));
}
