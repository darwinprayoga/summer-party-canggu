"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, Filter } from "lucide-react"

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

interface BlogCategoryFilterProps {
  categories: WordPressCategory[]
  allPosts: BlogPost[]
  selectedCategory?: string
}

export default function BlogCategoryFilter({ categories, allPosts, selectedCategory }: BlogCategoryFilterProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Get post counts for each category from our actual posts
  const categoryPostCounts = allPosts.reduce(
    (acc, post) => {
      acc[post.category] = (acc[post.category] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Combine WordPress categories with our post counts
  const availableCategories =
    categories.length > 0
      ? categories.filter((cat) => categoryPostCounts[cat.name] > 0)
      : Object.keys(categoryPostCounts).map((categoryName) => ({
          id: Math.random(),
          name: categoryName,
          slug: categoryName.toLowerCase().replace(/\s+/g, "-"),
          description: "",
          count: categoryPostCounts[categoryName],
        }))

  const totalPosts = allPosts.length

  if (availableCategories.length === 0) {
    return null
  }

  return (
    <div className="mb-12">
      {/* Desktop Category Filter */}
      <div className="hidden md:block">
        <div className="text-center mb-8">
          <h2 className="font-display font-semibold text-xl mb-6 flex items-center justify-center">
            <Filter className="w-5 h-5 mr-2 text-teal" />
            Browse by Category
          </h2>

          <div className="flex flex-wrap justify-center gap-3">
            {/* All Posts Option */}
            <Link
              href="/blog"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !selectedCategory ? "bg-teal text-white" : "bg-mint/20 text-teal hover:bg-mint/40"
              }`}
            >
              All Posts ({totalPosts})
            </Link>

            {/* Category Options */}
            {availableCategories.map((category) => (
              <Link
                key={category.id}
                href={`/blog?category=${encodeURIComponent(category.name)}`}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.name ? "bg-teal text-white" : "bg-mint/20 text-teal hover:bg-mint/40"
                }`}
              >
                {category.name} ({categoryPostCounts[category.name] || category.count})
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Category Filter */}
      <div className="md:hidden mb-8">
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-teal focus:border-teal"
          >
            <div className="flex items-center">
              <Filter className="w-4 h-4 mr-2 text-teal" />
              <span className="font-medium">{selectedCategory ? `${selectedCategory} Posts` : "All Categories"}</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </button>

          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <div className="py-2">
                {/* All Posts Option */}
                <Link
                  href="/blog"
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-2 text-sm hover:bg-gray-50 ${
                    !selectedCategory ? "bg-teal/10 text-teal font-medium" : "text-gray-700"
                  }`}
                >
                  All Posts ({totalPosts})
                </Link>

                {/* Category Options */}
                {availableCategories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/blog?category=${encodeURIComponent(category.name)}`}
                    onClick={() => setIsOpen(false)}
                    className={`block px-4 py-2 text-sm hover:bg-gray-50 ${
                      selectedCategory === category.name ? "bg-teal/10 text-teal font-medium" : "text-gray-700"
                    }`}
                  >
                    {category.name} ({categoryPostCounts[category.name] || category.count})
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Category Stats */}
      {availableCategories.length > 1 && (
        <div className="text-center text-sm text-gray-500 mb-4">
          {availableCategories.length} categories • {totalPosts} total posts
        </div>
      )}
    </div>
  )
}
