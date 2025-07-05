import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import { getPostBySlug, getAllPosts } from "@/lib/wordpress"
import { cleanTitle } from "@/lib/utils"

interface BlogPost {
  id: number
  title: { rendered: string }
  content: { rendered: string }
  excerpt: { rendered: string }
  slug: string
  date: string
  modified: string
  featured_media: number
  categories: number[]
  tags: number[]
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
      slug: string
    }>
  }
}

export async function generateStaticParams() {
  try {
    const posts = await getAllPosts()
    return posts.map((post: BlogPost) => ({
      slug: post.slug,
    }))
  } catch (error) {
    console.error("Error generating static params:", error)
    return []
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const post = await getPostBySlug(params.slug)

    if (!post) {
      return {
        title: "Post Not Found",
      }
    }

    const cleanedTitle = cleanTitle(post.title.rendered)
    const featuredImage = post._embedded?.["wp:featuredmedia"]?.[0]
    const excerpt = post.excerpt.rendered.replace(/<[^>]*>/g, "").substring(0, 160)

    return {
      title: `${cleanedTitle} | Summer Party Canggu Blog`,
      description: excerpt,
      openGraph: {
        title: cleanedTitle,
        description: excerpt,
        type: "article",
        publishedTime: post.date,
        modifiedTime: post.modified,
        images: featuredImage
          ? [
              {
                url: featuredImage.source_url,
                width: 1200,
                height: 630,
                alt: featuredImage.alt_text || cleanedTitle,
              },
            ]
          : [],
      },
      twitter: {
        card: "summary_large_image",
        title: cleanedTitle,
        description: excerpt,
        images: featuredImage ? [featuredImage.source_url] : [],
      },
    }
  } catch (error) {
    console.error("Error generating metadata:", error)
    return {
      title: "Blog Post | Summer Party Canggu",
    }
  }
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  try {
    const post = await getPostBySlug(params.slug)

    if (!post) {
      notFound()
    }

    const featuredImage = post._embedded?.["wp:featuredmedia"]?.[0]
    const categories = post._embedded?.["wp:term"]?.[0] || []
    const tags = post._embedded?.["wp:term"]?.[1] || []
    const author = post._embedded?.author?.[0]

    return (
      <article className="section-padding">
        <div className="container-custom max-w-4xl">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
            <Link href="/" className="hover:text-teal transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-teal transition-colors">
              Blog
            </Link>
            <span>/</span>
            <span className="text-charcoal font-medium">{cleanTitle(post.title.rendered)}</span>
          </nav>

          {/* Featured Image */}
          {featuredImage && (
            <div className="aspect-video relative mb-8 rounded-lg overflow-hidden">
              <Image
                src={featuredImage.source_url || "/placeholder.svg"}
                alt={featuredImage.alt_text || cleanTitle(post.title.rendered)}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Categories */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/blog?category=${category.slug}`}
                  className="px-3 py-1 bg-mint text-teal text-sm rounded-full hover:bg-teal hover:text-white transition-colors"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="font-display font-bold text-4xl md:text-5xl mb-6 leading-tight">
            {cleanTitle(post.title.rendered)}
          </h1>

          {/* Meta Information */}
          <div className="flex items-center gap-6 text-gray-600 text-sm mb-8 pb-8 border-b border-gray-200">
            <time dateTime={post.date}>
              Published{" "}
              {new Date(post.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            {post.modified !== post.date && (
              <time dateTime={post.modified}>
                Updated{" "}
                {new Date(post.modified).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            )}
            {author && <span>By {author.name}</span>}
          </div>

          {/* Content */}
          <div
            className="prose prose-lg max-w-none prose-headings:font-display prose-headings:font-bold prose-a:text-teal prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg prose-blockquote:border-l-teal prose-blockquote:border-l-4 prose-blockquote:bg-mint/10 prose-blockquote:py-4 prose-blockquote:px-6"
            dangerouslySetInnerHTML={{ __html: post.content.rendered }}
          />

          {/* Tags */}
          {tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="font-semibold text-lg mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span key={tag.id} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                    #{tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Back to Blog */}
          <div className="mt-12 text-center">
            <Link href="/blog" className="inline-flex items-center text-teal hover:text-teal/80 font-medium">
              ← Back to Blog
            </Link>
          </div>
        </div>
      </article>
    )
  } catch (error) {
    console.error("Error loading blog post:", error)
    notFound()
  }
}
