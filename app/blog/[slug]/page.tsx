import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, ExternalLink, MapPin } from "lucide-react";
import StructuredData from "../../components/StructuredData";
import { getWordPressPost, getAllPostSlugs } from "@/lib/wordpress";
import { cleanTitle } from "@/lib/utils";

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

// Extract first image from content with better parsing
function extractFirstImageFromContent(
  content: string,
): { src: string; alt: string } | null {
  const imgRegex = /<img[^>]+src="([^">]+)"[^>]*(?:alt="([^">]*)")?[^>]*>/i;
  const match = content.match(imgRegex);

  if (match) {
    return {
      src: match[1],
      alt: match[2] || "Summer Party Canggu Blog Image",
    };
  }
  return null;
}

// Calculate reading time
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const textContent = content.replace(/<[^>]*>/g, "").trim();
  const wordCount = textContent.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

// Generate static params for all blog posts
export async function generateStaticParams() {
  try {
    const slugs = await getAllPostSlugs();
    return slugs.map((slug) => ({
      slug: slug,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

// Enhanced metadata generation
export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const post = await getWordPressPost(params.slug);

  if (!post) {
    return {
      title: "Post Not Found | Summer Party Canggu Blog",
      description: "The blog post you're looking for could not be found.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = cleanTitle(post.title);
  const description =
    post.excerpt.length > 160
      ? post.excerpt.substring(0, 157) + "..."
      : post.excerpt;
  const publishedTime = new Date(post.date).toISOString();
  const readingTime = calculateReadingTime(post.content);

  // Get optimal image for Open Graph
  let ogImage = "https://summerpartycanggu.com/hero-background.png";
  if (post.image && post.image !== "/icon-landscape.webp") {
    ogImage = post.image;
  } else if (post.content) {
    const contentImage = extractFirstImageFromContent(post.content);
    if (contentImage) {
      ogImage = contentImage.src;
    }
  }

  return {
    title: `${title} | Summer Party Canggu Blog`,
    description,
    keywords: [
      post.category.toLowerCase(),
      "Canggu",
      "Bali",
      "beach party",
      "pool party",
      "summer party",
      "beach equipment rental",
      "surfboard rental",
      "Bali activities",
      "beach essentials",
      "party planning Bali",
    ],
    authors: [{ name: post.author }],
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: publishedTime,
      modifiedTime: publishedTime,
      authors: [post.author],
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      siteName: "Summer Party Canggu",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
      creator: "@summerpartycanggu",
    },
    alternates: {
      canonical: `https://summerpartycanggu.com/blog/${params.slug}`,
    },
    other: {
      "article:reading_time": readingTime.toString(),
      "article:section": post.category,
    },
  };
}

// Format date with better localization
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Strip HTML for clean text extraction
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Enhanced Post Content Component
async function PostContent({ slug }: { slug: string }) {
  const post = await getWordPressPost(slug);

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-charcoal mb-4">
          Post Not Found
        </h1>
        <p className="text-gray-600 mb-8">
          The blog post you're looking for doesn't exist or has been moved.
        </p>
        <Link href="/blog">
          <Button className="btn-primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>
        </Link>
      </div>
    );
  }

  const readingTime = calculateReadingTime(post.content);
  const contentImage = extractFirstImageFromContent(post.content);

  // Enhanced JSON-LD structured data
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: cleanTitle(post.title),
    description: stripHtml(post.excerpt),
    image: {
      "@type": "ImageObject",
      url:
        post.image ||
        contentImage?.src ||
        "https://summerpartycanggu.com/hero-background.png",
      width: 1200,
      height: 630,
    },
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Person",
      name: post.author,
      url: "https://summerpartycanggu.com/about",
    },
    publisher: {
      "@type": "Organization",
      name: "Summer Party Canggu",
      logo: {
        "@type": "ImageObject",
        url: "https://summerpartycanggu.com/logo.webp",
        width: 200,
        height: 60,
      },
      url: "https://summerpartycanggu.com",
      sameAs: [
        "https://www.instagram.com/summerpartycanggu",
        "https://wa.me/6285190459091",
      ],
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://summerpartycanggu.com/blog/${slug}`,
    },
    url: `https://summerpartycanggu.com/blog/${slug}`,
    articleSection: post.category,
    wordCount: post.content.split(" ").length,
    timeRequired: `PT${readingTime}M`,
    inLanguage: "en-US",
    about: {
      "@type": "Thing",
      name: "Beach Party Equipment Rental in Canggu, Bali",
    },
    mentions: [
      {
        "@type": "Place",
        name: "Canggu",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Canggu",
          addressRegion: "Bali",
          addressCountry: "Indonesia",
        },
      },
    ],
  };

  return (
    <>
      <StructuredData data={articleSchema} />

      <article
        className="section-padding"
        itemScope
        itemType="https://schema.org/BlogPosting"
      >
        <div className="container-custom max-w-4xl">
          {/* Enhanced Breadcrumb Navigation */}
          <nav className="mb-8" aria-label="Breadcrumb">
            <ol
              className="flex items-center space-x-2 text-sm text-gray-600"
              itemScope
              itemType="https://schema.org/BreadcrumbList"
            >
              <li
                itemProp="itemListElement"
                itemScope
                itemType="https://schema.org/ListItem"
              >
                <Link
                  href="/"
                  className="hover:text-teal transition-colors"
                  itemProp="item"
                >
                  <span itemProp="name">Home</span>
                </Link>
                <meta itemProp="position" content="1" />
              </li>
              <li>/</li>
              <li
                itemProp="itemListElement"
                itemScope
                itemType="https://schema.org/ListItem"
              >
                <Link
                  href="/blog"
                  className="hover:text-teal transition-colors"
                  itemProp="item"
                >
                  <span itemProp="name">Blog</span>
                </Link>
                <meta itemProp="position" content="2" />
              </li>
              <li>/</li>
              <li
                className="text-charcoal font-medium truncate"
                aria-current="page"
                itemProp="itemListElement"
                itemScope
                itemType="https://schema.org/ListItem"
              >
                <span itemProp="name">{cleanTitle(post.title)}</span>
                <meta itemProp="position" content="3" />
              </li>
            </ol>
          </nav>

          {/* Back to Blog Link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-teal transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          {/* Article Header */}
          <header className="mb-8">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <Badge
                className="bg-teal text-white hover:bg-teal/90"
                itemProp="articleSection"
              >
                {post.category}
              </Badge>
              <div className="flex items-center gap-4 text-gray-500 text-sm">
                <time
                  className="flex items-center gap-1"
                  dateTime={post.date}
                  itemProp="datePublished"
                >
                  <Calendar className="w-4 h-4" />
                  {formatDate(post.date)}
                </time>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{readingTime} min read</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>Canggu, Bali</span>
                </div>
              </div>
            </div>

            <h1
              className="font-display font-bold text-3xl md:text-4xl lg:text-5xl mb-4 leading-tight"
              itemProp="headline"
            >
              {cleanTitle(post.title)}
            </h1>

            <div className="flex items-center mb-8">
              <span className="text-gray-600">By </span>
              <span
                className="font-medium text-charcoal ml-1"
                itemProp="author"
                itemScope
                itemType="https://schema.org/Person"
              >
                <span itemProp="name">{post.author}</span>
              </span>
            </div>
          </header>

          {/* Enhanced Article Content */}
          <div
            className="prose prose-lg max-w-none 
                       prose-headings:font-display prose-headings:font-bold prose-headings:text-charcoal
                       prose-h1:text-3xl prose-h1:mb-6 prose-h1:mt-8 prose-h1:text-teal
                       prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-8 prose-h2:text-teal prose-h2:border-b prose-h2:border-gray-200 prose-h2:pb-2
                       prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-6 prose-h3:text-charcoal
                       prose-h4:text-lg prose-h4:mb-2 prose-h4:mt-4 prose-h4:text-charcoal
                       prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
                       prose-a:text-teal prose-a:no-underline hover:prose-a:text-teal/80 prose-a:font-medium
                       prose-strong:text-charcoal prose-strong:font-semibold
                       prose-em:text-gray-800 prose-em:italic
                       prose-ul:my-4 prose-ul:pl-6 prose-ul:list-disc
                       prose-ol:my-4 prose-ol:pl-6 prose-ol:list-decimal
                       prose-li:mb-2 prose-li:text-gray-700 prose-li:leading-relaxed
                       prose-blockquote:border-l-4 prose-blockquote:border-teal prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-gray-600 prose-blockquote:bg-mint/10 prose-blockquote:py-4 prose-blockquote:rounded-r-lg
                       prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:text-gray-800 prose-code:font-mono
                       prose-pre:bg-charcoal prose-pre:text-white prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-pre:shadow-lg
                       prose-img:rounded-lg prose-img:shadow-md prose-img:my-6 prose-img:border prose-img:border-gray-200
                       prose-hr:border-gray-300 prose-hr:my-8
                       prose-table:border-collapse prose-table:border prose-table:border-gray-300 prose-table:rounded-lg prose-table:overflow-hidden
                       prose-th:border prose-th:border-gray-300 prose-th:bg-mint/20 prose-th:p-3 prose-th:font-semibold prose-th:text-charcoal
                       prose-td:border prose-td:border-gray-300 prose-td:p-3 prose-td:text-gray-700"
            itemProp="articleBody"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Enhanced Article Footer CTA */}
          <footer className="mt-12 p-6 bg-gradient-to-r from-mint/20 to-teal/10 rounded-lg border border-mint/30">
            <h3 className="font-display font-bold text-xl mb-4 text-charcoal">
              Ready to Plan Your Perfect Beach Party in Canggu?
            </h3>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Get in touch with us on WhatsApp to discuss your beach or pool
              party needs! We provide premium equipment rentals and party
              planning services in Canggu, Bali.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="https://wa.me/6285190459091?text=Hi! I read your blog post about summer parties and I'm interested in your services"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center justify-center"
              >
                Contact Us on WhatsApp
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
              <Link
                href="/products"
                className="btn-secondary inline-flex items-center justify-center"
              >
                View Our Equipment
              </Link>
            </div>
          </footer>

          {/* Enhanced Navigation */}
          <nav
            className="mt-12 pt-8 border-t border-gray-200"
            aria-label="Post navigation"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <Link
                href="/blog"
                className="text-teal hover:text-teal/80 font-medium transition-colors flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to All Posts
              </Link>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/areas"
                  className="text-coral hover:text-red font-medium transition-colors"
                >
                  Explore Bali Locations →
                </Link>
                <Link
                  href="/products"
                  className="text-coral hover:text-red font-medium transition-colors"
                >
                  View Equipment →
                </Link>
              </div>
            </div>
          </nav>
        </div>
      </article>
    </>
  );
}

// Loading Skeleton Component
function LoadingSkeleton() {
  return (
    <div className="section-padding">
      <div className="container-custom max-w-4xl">
        <div className="animate-pulse">
          {/* Breadcrumb skeleton */}
          <div className="h-4 bg-gray-200 rounded w-48 mb-8"></div>

          {/* Back link skeleton */}
          <div className="h-4 bg-gray-200 rounded w-24 mb-6"></div>

          {/* Header skeleton */}
          <div className="mb-8">
            <div className="flex gap-4 mb-4">
              <div className="h-6 bg-gray-200 rounded-full w-20"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="h-12 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-2/3 mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-32 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>

          {/* Content skeleton */}
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Enable ISR with optimized revalidation
export const revalidate = 3600; // 1 hour

export default function BlogPostPage({ params }: BlogPostPageProps) {
  return (
    <div className="min-h-screen bg-white">
      <Suspense fallback={<LoadingSkeleton />}>
        <PostContent slug={params.slug} />
      </Suspense>
    </div>
  );
}
