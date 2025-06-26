// WordPress API integration with caching and error handling
interface WordPressPost {
  id: number
  date: string
  slug: string
  title: {
    rendered: string
  }
  content: {
    rendered: string
  }
  excerpt: {
    rendered: string
  }
  featured_media: number
  categories: number[]
  author: number
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url: string
      alt_text: string
    }>
    "wp:term"?: Array<
      Array<{
        id: number
        name: string
        slug: string
      }>
    >
    author?: Array<{
      name: string
    }>
  }
}

interface WordPressCategory {
  id: number
  name: string
  slug: string
  description: string
  count: number
}

interface BlogPost {
  slug: string
  title: string
  content: string
  excerpt: string
  date: string
  image: string
  category: string
  author: string
}

const WORDPRESS_API_BASE = "https://public-api.wordpress.com/wp/v2/sites/summerpartycanggu.wordpress.com"
const CACHE_DURATION = 3600 // 1 hour in seconds

// Fallback data in case WordPress API is unavailable
const fallbackPosts: BlogPost[] = [
  {
    slug: "best-beach-spots-canggu",
    title: "The Best Beach Spots in Canggu for Your Summer Party",
    excerpt: "Discover the most Instagram-worthy and party-friendly beaches in Canggu, Bali.",
    content: `
      <p>Canggu, Bali is home to some of the most beautiful beaches in Indonesia, perfect for hosting unforgettable summer parties. Whether you're planning a sunset celebration or a full-day beach bash, these spots offer the perfect backdrop for your event.</p>
      
      <h2>Echo Beach - The Party Central</h2>
      <p>Echo Beach is arguably the most popular spot for beach parties in Canggu. With its wide stretch of black volcanic sand and consistent waves, it's perfect for both surfers and party-goers. The beach is lined with trendy beach clubs and restaurants, making it easy to transition from day to night celebrations.</p>
      
      <h2>Batu Bolong Beach - The Instagram Favorite</h2>
      <p>Known for its iconic temple perched on a rock formation, Batu Bolong Beach offers stunning photo opportunities. The beach is slightly more secluded than Echo Beach, making it perfect for intimate gatherings and romantic sunset parties.</p>
      
      <h2>Berawa Beach - The Luxury Option</h2>
      <p>If you're looking for a more upscale beach party experience, Berawa Beach is your go-to destination. Home to some of Canggu's most exclusive beach clubs, this area offers premium amenities and services for your special event.</p>
    `,
    date: "2024-01-15",
    image: "/icon-landscape.webp",
    category: "Beach Guide",
    author: "Summer Party Canggu Team",
  },
  {
    slug: "pool-party-essentials-checklist",
    title: "Ultimate Pool Party Essentials Checklist",
    excerpt: "Everything you need to throw the perfect pool party in Bali.",
    content: `
      <p>Planning the perfect pool party in Bali requires careful preparation and the right equipment. Here's your comprehensive checklist to ensure your pool party is a splash hit!</p>
      
      <h2>Pool Floats and Inflatables</h2>
      <p>No pool party is complete without fun floats! From giant unicorns to elegant swan floats, these Instagram-worthy accessories are essential for creating that perfect party atmosphere. Make sure to have a variety of sizes to accommodate all your guests.</p>
      
      <h2>Cooling Solutions</h2>
      <p>Bali's tropical climate means you'll need plenty of ways to keep drinks and snacks cool. A premium cooler box is essential, along with plenty of ice and cold towels for your guests.</p>
      
      <h2>Entertainment and Music</h2>
      <p>Create the perfect ambiance with waterproof speakers and a curated playlist. Consider pool games like water volleyball or floating beer pong tables to keep the energy high throughout the day.</p>
    `,
    date: "2024-01-10",
    image: "/icon-landscape.webp",
    category: "Party Tips",
    author: "Summer Party Canggu Team",
  },
  {
    slug: "surfboard-guide-beginners",
    title: "Choosing the Right Surfboard: A Beginner's Guide",
    excerpt: "Learn how to select the perfect surfboard for Canggu's waves.",
    content: `
      <p>Canggu offers some of the best beginner-friendly waves in Bali, but choosing the right surfboard is crucial for your success and safety in the water. This guide will help you make the right choice for your skill level and the local conditions.</p>
      
      <h2>Board Length and Width</h2>
      <p>For beginners, longer and wider boards provide more stability. We recommend boards between 8'6" to 9'6" in length and at least 22" wide. This extra surface area makes it easier to catch waves and maintain balance while learning.</p>
      
      <h2>Foam vs. Fiberglass</h2>
      <p>Foam boards are perfect for beginners as they're safer and more forgiving. They're less likely to cause injury if you wipe out, and they're more buoyant, making it easier to paddle and catch waves.</p>
      
      <h2>Understanding Canggu's Waves</h2>
      <p>Canggu's waves are generally forgiving for beginners, especially at spots like Batu Bolong and Old Man's. The waves break over sand, which is safer than reef breaks, and there are waves suitable for all skill levels throughout the day.</p>
    `,
    date: "2024-01-05",
    image: "/icon-landscape.webp",
    category: "Surfing",
    author: "Summer Party Canggu Team",
  },
]

// Clean HTML content for better performance and security
function cleanHtmlContent(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove scripts
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "") // Remove styles
    .replace(/<!--[\s\S]*?-->/g, "") // Remove comments
    .trim()
}

// Extract plain text from HTML for excerpts
function extractTextFromHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/&nbsp;/g, " ") // Replace &nbsp; with space
    .replace(/&amp;/g, "&") // Replace &amp; with &
    .replace(/&lt;/g, "<") // Replace &lt; with <
    .replace(/&gt;/g, ">") // Replace &gt; with >
    .replace(/&quot;/g, '"') // Replace &quot; with "
    .replace(/&#039;/g, "'") // Replace &#039; with '
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .trim()
}

// Extract the first image URL from HTML content
function extractFirstImageFromHtml(html: string): string | null {
  const imgRegex = /<img[^>]+src="([^">]+)"/i
  const match = html.match(imgRegex)
  return match ? match[1] : null
}

// Fetch WordPress posts with caching and error handling
export async function getWordPressPosts(): Promise<BlogPost[]> {
  try {
    const response = await fetch(`${WORDPRESS_API_BASE}/posts?_embed&per_page=20&status=publish`, {
      next: { revalidate: CACHE_DURATION },
      headers: {
        Accept: "application/json",
        "User-Agent": "SummerPartyCanggu/1.0",
      },
    })

    if (!response.ok) {
      console.warn("WordPress API not available, using fallback data")
      return fallbackPosts
    }

    const posts: WordPressPost[] = await response.json()

    return posts.map((post): BlogPost => {
      // Get featured image - try featured media first, then first image in content, then fallback
      let featuredImage = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url
      if (!featuredImage) {
        featuredImage = extractFirstImageFromHtml(post.content.rendered)
      }
      if (!featuredImage) {
        featuredImage = "/icon-landscape.webp" // Use our brand image as fallback
      }

      // Get category name
      const categories = post._embedded?.["wp:term"]?.[0] || []
      const categoryName = categories.length > 0 ? categories[0].name : "General"

      // Get author name
      const authorName = post._embedded?.author?.[0]?.name || "Summer Party Canggu Team"

      // Clean and process content
      const cleanContent = cleanHtmlContent(post.content.rendered)
      const cleanExcerpt =
        extractTextFromHtml(post.excerpt.rendered) || extractTextFromHtml(cleanContent).substring(0, 200) + "..."

      return {
        slug: post.slug,
        title: extractTextFromHtml(post.title.rendered),
        content: cleanContent,
        excerpt: cleanExcerpt,
        date: post.date,
        image: featuredImage,
        category: categoryName,
        author: authorName,
      }
    })
  } catch (error) {
    console.error("Error fetching WordPress posts:", error)
    return fallbackPosts
  }
}

// Fetch single WordPress post
export async function getWordPressPost(slug: string): Promise<BlogPost | null> {
  try {
    const response = await fetch(`${WORDPRESS_API_BASE}/posts?slug=${slug}&_embed`, {
      next: { revalidate: CACHE_DURATION },
      headers: {
        Accept: "application/json",
        "User-Agent": "SummerPartyCanggu/1.0",
      },
    })

    if (!response.ok) {
      // Try fallback data
      const fallbackPost = fallbackPosts.find((post) => post.slug === slug)
      return fallbackPost || null
    }

    const posts: WordPressPost[] = await response.json()

    if (posts.length === 0) {
      // Try fallback data
      const fallbackPost = fallbackPosts.find((post) => post.slug === slug)
      return fallbackPost || null
    }

    const post = posts[0]

    // Get featured image - try featured media first, then first image in content, then fallback
    let featuredImage = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url
    if (!featuredImage) {
      featuredImage = extractFirstImageFromHtml(post.content.rendered)
    }
    if (!featuredImage) {
      featuredImage = "/icon-landscape.webp" // Use our brand image as fallback
    }

    // Get category name
    const categories = post._embedded?.["wp:term"]?.[0] || []
    const categoryName = categories.length > 0 ? categories[0].name : "General"

    // Get author name
    const authorName = post._embedded?.author?.[0]?.name || "Summer Party Canggu Team"

    // Clean and process content
    const cleanContent = cleanHtmlContent(post.content.rendered)
    const cleanExcerpt =
      extractTextFromHtml(post.excerpt.rendered) || extractTextFromHtml(cleanContent).substring(0, 200) + "..."

    return {
      slug: post.slug,
      title: extractTextFromHtml(post.title.rendered),
      content: cleanContent,
      excerpt: cleanExcerpt,
      date: post.date,
      image: featuredImage,
      category: categoryName,
      author: authorName,
    }
  } catch (error) {
    console.error("Error fetching WordPress post:", error)
    // Try fallback data
    const fallbackPost = fallbackPosts.find((post) => post.slug === slug)
    return fallbackPost || null
  }
}

// Fetch WordPress categories
export async function getWordPressCategories(): Promise<WordPressCategory[]> {
  try {
    const response = await fetch(`${WORDPRESS_API_BASE}/categories?per_page=50`, {
      next: { revalidate: CACHE_DURATION },
      headers: {
        Accept: "application/json",
        "User-Agent": "SummerPartyCanggu/1.0",
      },
    })

    if (!response.ok) {
      return []
    }

    const categories: WordPressCategory[] = await response.json()
    return categories.filter((cat) => cat.count > 0) // Only return categories with posts
  } catch (error) {
    console.error("Error fetching WordPress categories:", error)
    return []
  }
}

// Generate all post slugs for static generation
export async function getAllPostSlugs(): Promise<string[]> {
  try {
    const posts = await getWordPressPosts()
    return posts.map((post) => post.slug)
  } catch (error) {
    console.error("Error fetching post slugs:", error)
    return fallbackPosts.map((post) => post.slug)
  }
}
