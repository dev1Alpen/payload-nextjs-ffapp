'use client'

import { useState, useEffect, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Post, Media, Category } from '@/payload-types'
import CategoryFilter from './CategoryFilter'
import ArrowIcon from '@/components/common/ArrowIcon'
import AnimatedPostsGrid from './AnimatedPostsGrid'
import { getCategoryLabel, getCategoryPath } from '@/lib/categories'

// Helper function to extract category identifier (ID or slug) from category
function getCategoryIdentifier(category: Category | number | string | null | undefined): string | number | null {
  if (!category) return null
  if (typeof category === 'number' || typeof category === 'string') return category
  if (typeof category === 'object' && 'id' in category) {
    // If it's a Category object, try to get slug first, then fall back to ID
    if ('slug' in category && category.slug) {
      if (typeof category.slug === 'string') {
        return category.slug
      } else if (typeof category.slug === 'object' && category.slug !== null) {
        // Localized slug object
        const slugObj = category.slug as Record<string, string>
        return slugObj.de || slugObj.en || category.id
      }
    }
    return category.id
  }
  return null
}

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function getImageUrl(image: Media | number | null | undefined): string {
  const fallback = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80'

  if (!image) return fallback

  if (typeof image === 'number') return fallback

  if (image.url) return image.url

  return fallback
}

function getPostLink(post: Post, locale: 'en' | 'de' = 'de'): string {
  let categoryPath = 'news'
  
  if (post.category) {
    if (typeof post.category === 'object' && post.category !== null) {
      // Category is populated - use getCategoryPath from lib
      categoryPath = getCategoryPath(post.category, locale)
    } else if (typeof post.category === 'string') {
      // Legacy: category is a string slug
      categoryPath = post.category
    }
  }
  
  // Handle localized slug - it might be a string or an object
  let slug: string | undefined
  if ('slug' in post && post.slug !== undefined && post.slug !== null) {
    if (typeof post.slug === 'string') {
      slug = post.slug
    } else if (typeof post.slug === 'object' && post.slug !== null) {
      // Handle localized slug object
      const slugObj = post.slug as Record<string, string>
      slug = slugObj[locale] || slugObj.en || slugObj.de
    }
  }
  
  if (slug) {
    return `/${categoryPath}/${slug}${locale ? `?lang=${locale}` : ''}`
  }
  // Fallback to ID if slug is not available
  return `/${categoryPath}/${post.id}${locale ? `?lang=${locale}` : ''}`
}

interface AllPostsClientProps {
  initialPosts: Post[]
  initialCategory: string | null
  initialSearchQuery?: string | null
  locale: 'en' | 'de'
}

export default function AllPostsClient({ initialPosts, initialCategory, initialSearchQuery, locale }: AllPostsClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory)
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchQuery || '')
  const [isPending, startTransition] = useTransition()
  const [posts] = useState<Post[]>(initialPosts)

  // Get unique categories from posts
  // We need to collect actual Category objects or IDs for the filter
  const categoryMap = new Map<string | number, Category | number>()
  posts.forEach((post) => {
    if (post.category) {
      const categoryId = getCategoryIdentifier(post.category)
      if (categoryId && !categoryMap.has(categoryId)) {
        // Store the category as-is (object, number, or string)
        if (typeof post.category === 'object' && post.category !== null) {
          categoryMap.set(categoryId, post.category)
        } else {
          categoryMap.set(categoryId, post.category)
        }
      }
    }
  })
  const uniqueCategories = Array.from(categoryMap.values())

  // Filter posts based on selected category and search query
  const filteredPosts = posts.filter((post) => {
    // Category filter - compare identifiers
    if (selectedCategory) {
      const postCategoryId = getCategoryIdentifier(post.category)
      if (!postCategoryId || String(postCategoryId) !== selectedCategory) {
        return false
      }
    }
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      const title = post.title?.toLowerCase() || ''
      return title.includes(query)
    }
    
    return true
  })

  const handleCategoryChange = (category: Category | number | string | null) => {
    startTransition(() => {
      // Convert category to identifier string for state
      const categoryId = category ? String(getCategoryIdentifier(category)) : null
      setSelectedCategory(categoryId)
      // Update URL without navigation
      const params = new URLSearchParams(window.location.search)
      if (categoryId) {
        params.set('category', categoryId)
      } else {
        params.delete('category')
      }
      const newUrl = `${window.location.pathname}?${params.toString()}`
      window.history.pushState({}, '', newUrl)
    })
  }

  // Update search query from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlSearchQuery = params.get('search') || ''
    if (urlSearchQuery !== searchQuery) {
      setSearchQuery(urlSearchQuery)
    }
  }, [searchQuery])

  return (
    <>
      {/* Search Bar */}
      {initialSearchQuery && (
        <div className="mb-6">
          <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-600">
                  {locale === 'de' ? 'Suchergebnisse für' : 'Search results for'}: <span className="font-bold">&quot;{searchQuery}&quot;</span>
                </p>
                <p className="text-xs text-red-600 mt-1">
                  {filteredPosts.length} {filteredPosts.length === 1 ? (locale === 'de' ? 'Ergebnis gefunden' : 'result found') : locale === 'de' ? 'Ergebnisse gefunden' : 'results found'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  const params = new URLSearchParams(window.location.search)
                  params.delete('search')
                  const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`
                  window.history.pushState({}, '', newUrl)
                  window.location.reload()
                }}
                className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-500 hover:bg-red-200 rounded-md transition-colors"
              >
                {locale === 'de' ? 'Zurücksetzen' : 'Clear'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Filter */}
      {uniqueCategories.length > 0 && (
        <CategoryFilter
          categories={uniqueCategories}
          activeCategory={selectedCategory ? selectedCategory : null}
          locale={locale}
          getCategoryLabel={getCategoryLabel}
          onCategoryChange={handleCategoryChange}
          isPending={isPending}
        />
      )}

      {/* Posts Grid */}
      <AnimatedPostsGrid filterKey={selectedCategory}>
        {filteredPosts.length > 0 ? (
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8`}>
            {filteredPosts.map((post, index) => (
              <Link
                key={post.id}
                href={getPostLink(post, locale)}
                className="group bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 flex flex-col cursor-pointer post-card animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Image */}
                <div className="relative w-full h-72 flex-shrink-0 overflow-hidden">
                  <Image
                    src={getImageUrl(post.featuredImage)}
                    alt={post.title || 'Post'}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />

                  {post.category && (
                    <div className="absolute top-4 left-4 z-10">
                      <span className="bg-gradient-to-r from-red-600 to-red-500 text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-wider shadow-xl backdrop-blur-md border border-white/20">
                        {getCategoryLabel(post.category, locale)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 p-6 flex flex-col justify-between bg-gradient-to-b from-white to-gray-50">
                  <div>
                    <div className="flex items-center space-x-2 mb-4 text-xs text-gray-500 font-medium">
                      <div className="flex items-center space-x-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span>{formatDate(post.publishedDate || post.createdAt)}</span>
                      </div>
                    </div>

                    <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-4 leading-tight line-clamp-2">
                      {post.title}
                    </h2>
                  </div>

                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-600/10 hover:bg-red-600/20 text-red-600 hover:text-red-500 transition-all mt-auto border-t-2 border-gray-100 group/link">
                    <ArrowIcon
                      direction="right"
                      className="w-5 h-5 transform group-hover/link:translate-x-1 transition-transform"
                      strokeWidth={2.5}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="relative mb-8">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 bg-red-100 rounded-full blur-3xl opacity-50"></div>
                </div>
                <svg
                  className="relative w-24 h-24 mx-auto text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {locale === 'de' ? 'Keine Beiträge gefunden' : 'No posts found'}
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                {selectedCategory
                  ? (() => {
                      const category = categoryMap.get(selectedCategory)
                      const categoryLabel = category ? getCategoryLabel(category, locale) : selectedCategory
                      return locale === 'de'
                        ? `Es wurden keine Beiträge in der Kategorie "${categoryLabel}" gefunden.`
                        : `No posts found in category "${categoryLabel}".`
                    })()
                  : locale === 'de'
                    ? 'Es sind noch keine Beiträge verfügbar.'
                    : 'No posts are available yet.'}
              </p>
            </div>
          </div>
        )}
      </AnimatedPostsGrid>
    </>
  )
}

