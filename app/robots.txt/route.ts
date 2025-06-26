export async function GET() {
  const robotsTxt = `User-agent: *
Allow: /

# Disallow admin and private areas
Disallow: /admin/
Disallow: /private/
Disallow: /_next/
Disallow: /api/

# Allow important pages
Allow: /blog
Allow: /products
Allow: /areas

# Sitemap location
Sitemap: https://summerpartycanggu.com/sitemap.xml

# Crawl delay (optional - be nice to servers)
Crawl-delay: 1`

  return new Response(robotsTxt, {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=86400, s-maxage=86400", // Cache for 24 hours
    },
  })
}
