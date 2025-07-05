import { Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { getAllPosts } from "@/lib/wordpress"
import { cleanTitle } from "@/lib/utils"
import BlogCategoryFilter from "../components/BlogCategoryFilter"

interface BlogPost {
  id: number
  title: { rendered: string }
  excerpt: { rendered: string }
  slug: string
  date: string
  featured_media: number
  categories: number[]
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
  }
}

async function BlogContent({ searchParams }: { searchParams: { category?: string } }) {
  const posts = await getAllPosts()

  // Filter posts by category if specified
  const filteredPosts = searchParams.category
    ? posts.filter((post: BlogPost) => {
        const categories = post._embedded?.["wp:term"]?.[0] || []
        return categories.some((cat) => cat.slug === searchParams.category)
      })
    : posts

  return (
    <div className="section-padding">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h1 className="font-display font-bold text-4xl md:text-5xl mb-4">
            Summer Party <span className="text-teal">Blog</span>
          </h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Discover the best beach and pool party tips, locations, and equipment guides for your perfect Bali
            celebration.
          </p>
        </div>

        <BlogCategoryFilter />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post: BlogPost) => {
            const featuredImage = post._embedded?.["wp:featuredmedia"]?.[0]
            const categories = post._embedded?.["wp:term"]?.[0] || []

            return (
              <article
                key={post.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {featuredImage && (
                  <div className="aspect-video relative">
                    <Image
                      src={featuredImage.source_url || "/placeholder.svg"}
                      alt={featuredImage.alt_text || cleanTitle(post.title.rendered)}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                <div className="p-6">
                  {categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {categories.slice(0, 2).map((category) => (
                        <span key={category.id} className="px-3 py-1 bg-mint text-teal text-sm rounded-full">
                          {category.name}
                        </span>
                      ))}
                    </div>
                  )}

                  <h2 className="font-display font-bold text-xl mb-3 line-clamp-2">
                    <Link href={`/blog/${post.slug}`} className="hover:text-teal transition-colors">
                      {cleanTitle(post.title.rendered)}
                    </Link>
                  </h2>

                  <div
                    className="text-gray-600 text-sm mb-4 line-clamp-3"
                    dangerouslySetInnerHTML={{
                      __html: post.excerpt.rendered.replace(/<[^>]*>/g, "").substring(0, 150) + "...",
                    }}
                  />

                  <div className="flex items-center justify-between">
                    <time className="text-gray-500 text-sm">
                      {new Date(post.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>

                    <Link href={`/blog/${post.slug}`} className="text-teal hover:text-teal/80 font-medium text-sm">
                      Read More →
                    </Link>
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No posts found in this category.</p>
            <Link href="/blog" className="text-teal hover:text-teal/80 font-medium mt-4 inline-block">
              ← View All Posts
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default function BlogPage({ searchParams }: { searchParams: { category?: string } }) {
  return (
    <Suspense
      fallback={
        <div className="section-padding">
          <div className="container-custom">
            <div className="text-center">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <BlogContent searchParams={searchParams} />
    </Suspense>
  )
}
