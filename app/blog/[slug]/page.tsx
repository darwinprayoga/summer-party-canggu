import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import StructuredData from "../../components/StructuredData";
import { getWordPressPost, getAllPostSlugs } from "@/lib/wordpress";

interface BlogPostPageProps {
  params: {
    slug: string;
  };
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

// Generate metadata for each blog post
export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const post = await getWordPressPost(params.slug);

  if (!post) {
    return {
      title: "Post Not Found | Summer Party Canggu",
      description: "The blog post you're looking for could not be found.",
    };
  }

  const publishedTime = new Date(post.date).toISOString();

  return {
    title: `${post.title} | Summer Party Canggu Blog`,
    description: post.excerpt,
    keywords: [
      post.category.toLowerCase(),
      "Canggu",
      "Bali",
      "beach party",
      "pool party",
      "summer party",
      "beach essentials",
    ],
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: publishedTime,
      authors: [post.author],
      images: [
        {
          url: post.image,
          width: 800,
          height: 400,
          alt: post.title,
        },
      ],
      siteName: "Summer Party Canggu",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [post.image],
    },
    alternates: {
      canonical: `https://summer.prayoga.io/blog/${params.slug}`,
    },
  };
}

// Enable ISR with 1 hour revalidation
export const revalidate = 3600;

export default async function BlogPost({ params }: BlogPostPageProps) {
  const post = await getWordPressPost(params.slug);

  if (!post) {
    notFound();
  }

  const publishedDate = new Date(post.date);
  const readingTime = Math.ceil(post.content.split(" ").length / 200); // Estimate reading time

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: {
      "@type": "ImageObject",
      url: post.image,
      width: 800,
      height: 400,
    },
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "Summer Party Canggu",
      logo: {
        "@type": "ImageObject",
        url: "https://summer.prayoga.io/logo.webp",
        width: 200,
        height: 60,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://summer.prayoga.io/blog/${params.slug}`,
    },
    articleSection: post.category,
    wordCount: post.content.split(" ").length,
    timeRequired: `PT${readingTime}M`,
  };

  return (
    <>
      <StructuredData data={articleSchema} />

      <article className="section-padding">
        <div className="container-custom max-w-4xl">
          {/* Breadcrumb Navigation */}
          <nav className="mb-8" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm text-gray-600">
              <li>
                <Link href="/" className="hover:text-teal transition-colors">
                  Home
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link
                  href="/blog"
                  className="hover:text-teal transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>/</li>
              <li className="text-charcoal font-medium" aria-current="page">
                {post.title}
              </li>
            </ol>
          </nav>

          {/* Article Header */}
          <header className="mb-8">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <span className="bg-teal text-white px-3 py-1 rounded-full text-sm font-medium">
                {post.category}
              </span>
              <time className="text-gray-500 text-sm" dateTime={post.date}>
                {publishedDate.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              <span className="text-gray-500 text-sm">
                {readingTime} min read
              </span>
            </div>

            <h1 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl mb-4 leading-tight">
              {post.title}
            </h1>

            <p className="text-xl text-gray-600 mb-6 leading-relaxed">
              {post.excerpt}
            </p>

            <div className="flex items-center mb-8">
              <span className="text-gray-600">By </span>
              <span className="font-medium text-charcoal ml-1">
                {post.author}
              </span>
            </div>

            <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden shadow-lg mb-8">
              <Image
                src={post.image || "/placeholder.svg"}
                alt={post.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 800px"
              />
            </div>
          </header>

          {/* Article Content */}
          <div
            className="prose prose-lg max-w-none 
                       prose-headings:font-display prose-headings:font-bold 
                       prose-h2:text-2xl prose-h2:text-teal prose-h2:mt-8 prose-h2:mb-4
                       prose-h3:text-xl prose-h3:text-charcoal prose-h3:mt-6 prose-h3:mb-3
                       prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
                       prose-a:text-teal prose-a:no-underline hover:prose-a:text-teal/80
                       prose-strong:text-charcoal prose-strong:font-semibold
                       prose-ul:my-4 prose-li:my-1
                       prose-img:rounded-lg prose-img:shadow-md"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Article Footer CTA */}
          <footer className="mt-12 p-6 bg-mint/20 rounded-lg">
            <h3 className="font-display font-bold text-xl mb-4">
              Ready to Plan Your Summer Party?
            </h3>
            <p className="text-gray-700 mb-4">
              Get in touch with us on WhatsApp to discuss your beach or pool
              party needs in Canggu!
            </p>
            <a
              href="https://wa.me/6285190459091?text=Hi! I read your blog post about summer parties and I'm interested in your services"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Contact Us on WhatsApp
            </a>
          </footer>

          {/* Related Posts Navigation */}
          <nav
            className="mt-12 pt-8 border-t border-gray-200"
            aria-label="Related posts"
          >
            <div className="flex justify-between items-center">
              <Link
                href="/blog"
                className="text-teal hover:text-teal/80 font-medium transition-colors flex items-center"
              >
                ← Back to All Posts
              </Link>
              <div className="flex space-x-4">
                <Link
                  href="/products"
                  className="text-coral hover:text-red font-medium transition-colors"
                >
                  View Our Equipment →
                </Link>
              </div>
            </div>
          </nav>
        </div>
      </article>
    </>
  );
}
