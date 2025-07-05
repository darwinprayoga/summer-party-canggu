import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getWordPressPosts, getWordPressCategories } from "@/lib/wordpress";
import BlogCategoryFilter from "../components/BlogCategoryFilter";
import { cleanTitle } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Blog - Summer Party Tips & Canggu Guides",
  description:
    "Discover the best tips for beach parties, pool days, and exploring Canggu, Bali. Your guide to the perfect summer experience.",
  openGraph: {
    title: "Summer Party Canggu Blog - Beach & Pool Party Tips",
    description:
      "Expert guides for beach parties, pool days, and Canggu adventures in Bali",
    type: "website",
    images: [
      {
        url: "/icon-landscape.webp",
        width: 1200,
        height: 630,
        alt: "Summer Party Canggu Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Summer Party Canggu Blog - Beach & Pool Party Tips",
    description:
      "Expert guides for beach parties, pool days, and Canggu adventures in Bali",
    images: ["/icon-landscape.webp"],
  },
};

// Enable ISR with 1 hour revalidation
export const revalidate = 3600;

interface BlogPageProps {
  searchParams: {
    category?: string;
  };
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  // Fetch posts and categories in parallel for better performance
  const [allBlogPosts, categories] = await Promise.all([
    getWordPressPosts(),
    getWordPressCategories(),
  ]);

  // Filter posts by category if specified
  const selectedCategory = searchParams.category;
  const blogPosts = selectedCategory
    ? allBlogPosts.filter(
        (post) =>
          post.category.toLowerCase() === selectedCategory.toLowerCase(),
      )
    : allBlogPosts;

  return (
    <div className="section-padding">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h1 className="font-display font-bold text-4xl md:text-5xl mb-4">
            Our Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tips, guides, and inspiration for your perfect Canggu experience
          </p>
        </div>

        {/* Category Filter Section */}
        <BlogCategoryFilter
          categories={categories}
          allPosts={allBlogPosts}
          selectedCategory={selectedCategory}
        />

        {/* Selected Category Header */}
        {selectedCategory && (
          <div className="mb-8 text-center">
            <h2 className="font-display font-semibold text-2xl mb-2">
              {selectedCategory} Posts
            </h2>
            <p className="text-gray-600">
              {blogPosts.length} {blogPosts.length === 1 ? "post" : "posts"}{" "}
              found
            </p>
            <Link
              href="/blog"
              className="text-teal hover:text-teal/80 font-medium transition-colors text-sm"
            >
              ← View All Posts
            </Link>
          </div>
        )}

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <article
              key={post.slug}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <Link href={`/blog/${post.slug}`}>
                <div className="relative h-48 w-full">
                  <Image
                    src={post.image || "/placeholder.svg"}
                    alt={post.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    loading="lazy"
                  />
                </div>
              </Link>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Link
                    href={`/blog?category=${encodeURIComponent(post.category)}`}
                    className="text-sm text-teal font-medium bg-teal/10 px-2 py-1 rounded hover:bg-teal/20 transition-colors"
                  >
                    {post.category}
                  </Link>
                  <time className="text-sm text-gray-500" dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                </div>
                <h2 className="font-display font-semibold text-xl mb-2">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="hover:text-teal transition-colors"
                  >
                    {cleanTitle(post.title)}
                  </Link>
                </h2>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    By {post.author}
                  </span>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-coral hover:text-red font-medium transition-colors text-sm"
                  >
                    Read More →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* No posts fallback */}
        {blogPosts.length === 0 && (
          <div className="text-center py-12">
            <h3 className="font-display font-semibold text-xl mb-4">
              {selectedCategory
                ? `No posts found in "${selectedCategory}"`
                : "No posts available"}
            </h3>
            <p className="text-gray-600 mb-6">
              {selectedCategory
                ? "Try browsing other categories or view all posts."
                : "We're working on adding fresh content. Check back soon for the latest tips and guides!"}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {selectedCategory && (
                <Link href="/blog" className="btn-secondary">
                  View All Posts
                </Link>
              )}
              <Link href="/" className="btn-primary">
                Back to Home
              </Link>
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 p-8 bg-gradient-to-r from-mint/20 to-teal/10 rounded-2xl text-center">
          <h3 className="font-display font-bold text-2xl mb-4">
            Ready to Plan Your Summer Party?
          </h3>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
            Get inspired by our blog posts and let us help you create the
            perfect beach or pool party experience in Canggu!
          </p>
          <a
            href="https://wa.me/6285190459091?text=Hi! I read your blog and I'm interested in planning a summer party"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            Contact Us on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
