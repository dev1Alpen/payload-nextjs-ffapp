import React from 'react'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@/payload.config'
import type { Post, Media, Category } from '@/payload-types'
import CategorySearch from '@/components/home/CategorySearch'
import Breadcrumb from '@/components/common/Breadcrumb'
import AnimatedPostsGrid from './AnimatedPostsGrid'
import CategoryFilter from './CategoryFilter'
import FeaturedPostCard from './FeaturedPostCard'
import PostCard from './PostCard'
import ArrowIcon from '@/components/common/ArrowIcon'
import { getCategoryLabel, getCategoryPath } from '@/lib/categories'

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
  const categoryPath = post.category 
    ? (typeof post.category === 'number' ? 'news' : getCategoryPath(post.category, locale))
    : 'news'
  if (post.slug) {
    return `/${categoryPath}/${post.slug}`
  }
  return `/${categoryPath}/${post.id}`
}

interface NewsCategoryPageProps {
  category: string | number | Category | null
  locale: 'en' | 'de'
  showSidebar?: boolean
  allPostsAsCards?: boolean
  showCategoryFilter?: boolean
}

export default async function NewsCategoryPage({ category, locale, showSidebar = true, allPostsAsCards = false, showCategoryFilter = false }: NewsCategoryPageProps) {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  // Build where clause
  const where: any = {
    _status: {
      equals: 'published',
    },
  }

  // Handle category filter - can be string (ID or slug), number (ID), or Category object
  if (category) {
    let categoryId: number | null = null
    
    if (typeof category === 'number') {
      categoryId = category
    } else if (typeof category === 'object' && category !== null && 'id' in category) {
      categoryId = category.id
    } else if (typeof category === 'string') {
      // Check if it's a numeric string (ID) or a slug
      const numericId = parseInt(category, 10)
      if (!isNaN(numericId) && String(numericId) === category) {
        // It's a numeric string (ID)
        categoryId = numericId
      } else {
        // It's a slug string - find the category by slug
        try {
          const categoryResult = await payload.find({
            collection: 'categories',
            where: {
              or: [
                { 'slug.en': { equals: category } },
                { 'slug.de': { equals: category } },
              ],
            },
            limit: 1,
            locale,
          })
          if (categoryResult.docs.length > 0) {
            categoryId = categoryResult.docs[0].id
          }
        } catch (error) {
          console.error('Error finding category by slug:', error)
        }
      }
    }
    
    // Apply category filter to posts query
    if (categoryId) {
      where.category = {
        equals: categoryId,
      }
    }
  }

  // Fetch published posts filtered by category
  // When showing all posts (no category) or on all_posts page, fetch more posts
  const postLimit = (category && !allPostsAsCards) ? 20 : 100
  
  const { docs: posts, totalDocs } = await payload.find({
    collection: 'posts',
    where,
    limit: postLimit,
    depth: 2, // Populate featuredImage and author relationships
    sort: '-publishedDate',
    locale,
  })

  // Get current category and label first (needed for sidebar logic)
  let currentCategory: Category | number | string | null = category
  let currentCategoryLabel: string | null = null
  let currentCategorySlug: string | null = null
  
  if (category) {
    if (typeof category === 'string') {
      // Check if it's a numeric string (ID) or a slug
      const numericId = parseInt(category, 10)
      if (!isNaN(numericId) && String(numericId) === category) {
        // It's a numeric string (ID from query parameter)
        try {
          const cat = await payload.findByID({
            collection: 'categories',
            id: numericId,
            locale,
          })
          currentCategory = cat as Category
          currentCategoryLabel = getCategoryLabel(cat as Category, locale)
          currentCategorySlug = getCategoryPath(cat as Category, locale)
        } catch (error) {
          // Try to find by slug as fallback
          try {
            const categoryResult = await payload.find({
              collection: 'categories',
              where: {
                or: [
                  { 'slug.en': { equals: category } },
                  { 'slug.de': { equals: category } },
                ],
              },
              limit: 1,
              locale,
            })
            if (categoryResult.docs.length > 0) {
              currentCategory = categoryResult.docs[0] as Category
              currentCategoryLabel = getCategoryLabel(categoryResult.docs[0], locale)
              currentCategorySlug = getCategoryPath(categoryResult.docs[0], locale)
            } else {
              currentCategoryLabel = category // Fallback to slug
              currentCategorySlug = category
            }
          } catch (error2) {
            currentCategoryLabel = category
            currentCategorySlug = category
          }
        }
      } else {
        // It's a slug string
        currentCategorySlug = category
        try {
          const categoryResult = await payload.find({
            collection: 'categories',
            where: {
              or: [
                { 'slug.en': { equals: category } },
                { 'slug.de': { equals: category } },
              ],
            },
            limit: 1,
            locale,
          })
          if (categoryResult.docs.length > 0) {
            currentCategory = categoryResult.docs[0] as Category
            currentCategoryLabel = getCategoryLabel(categoryResult.docs[0], locale)
          } else {
            currentCategoryLabel = category // Fallback to slug
          }
        } catch (error) {
          currentCategoryLabel = category
        }
      }
    } else if (typeof category === 'number') {
      // Category ID - fetch it
      try {
        const cat = await payload.findByID({
          collection: 'categories',
          id: category,
          locale,
        })
        currentCategory = cat as Category
        currentCategoryLabel = getCategoryLabel(cat as Category, locale)
        currentCategorySlug = getCategoryPath(cat as Category, locale)
      } catch (error) {
        currentCategoryLabel = null
      }
    } else {
      // Category object
      currentCategoryLabel = getCategoryLabel(category, locale)
      currentCategorySlug = getCategoryPath(category, locale)
    }
  }
  
  // For CategorySearch, use slug for highlighting (since URLs use slugs)
  const activeCategoryForSearch = currentCategorySlug || currentCategory
  
  // Get categories for sidebar or category filter (after resolving currentCategory)
  // Only show categories that have published posts (relevant categories)
  let uniqueCategories: Category[] = []
  if (showSidebar || showCategoryFilter) {
    try {
      // First, get all published posts to find which categories have posts
      const allPublishedPosts = await payload.find({
        collection: 'posts',
        where: {
          _status: {
            equals: 'published',
          },
        },
        limit: 1000, // Get enough posts to find all categories
        depth: 1, // Only need category relationship
        locale,
        select: {
          category: true,
        },
      })

      // Extract unique category IDs from posts
      const categoryIds = new Set<number>()
      allPublishedPosts.docs.forEach((post) => {
        if (post.category) {
          const categoryId = typeof post.category === 'number' ? post.category : post.category.id
          if (categoryId) {
            categoryIds.add(categoryId)
          }
        }
      })

      // Always show all categories that have published posts (relevant categories)
      // This allows users to navigate between categories from any category page
      if (categoryIds.size > 0) {
        const categoriesResult = await payload.find({
          collection: 'categories',
          where: {
            and: [
              {
                id: {
                  in: Array.from(categoryIds),
                },
              },
              {
                active: {
                  equals: true,
                },
              },
            ],
          },
          limit: 100,
          sort: 'name',
          locale,
        })
        uniqueCategories = categoriesResult.docs as Category[]
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const featuredPost = allPostsAsCards ? null : (posts.length > 0 ? posts[0] : null)
  const otherPosts = allPostsAsCards ? posts : posts.slice(1)

  return (
    <section className="w-full bg-white min-h-screen pb-16 md:pb-20">
      {/* Modern Hero Header Section */}
      <div className="relative bg-gradient-to-br from-gray-900 via-red-600 to-red-500 overflow-hidden">
        {/* Modern Geometric Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(30deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%), linear-gradient(60deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)`,
            backgroundSize: '60px 60px',
          }}></div>
        </div>
        
        {/* Animated Gradient Orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-600/30 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-16 md:py-20">
          <div className="max-w-5xl">
            {/* Modern Category Badge */}
            <div className="flex items-center flex-wrap gap-4 mb-6">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl rounded-2xl px-5 py-2.5 border border-white/20 shadow-xl">
                <div className="p-1.5 bg-white/20 rounded-xl">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <span className="text-white text-sm font-bold uppercase tracking-widest">
                  {currentCategoryLabel || (locale === 'de' ? 'Alle Beiträge' : 'All Posts')}
                </span>
              </div>
              {totalDocs > 0 && (
                <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10">
                  <svg className="w-4 h-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-white/90 text-sm font-semibold">
                    {totalDocs} {totalDocs === 1 ? (locale === 'de' ? 'Beitrag' : 'post') : locale === 'de' ? 'Beiträge' : 'posts'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 pt-6 md:pt-8">
        <div className={`grid grid-cols-1 ${showSidebar ? 'lg:grid-cols-3' : ''} gap-8 lg:gap-12`}>
          {/* Breadcrumbs - Above main content */}
          <div className={showSidebar ? 'lg:col-span-2' : ''}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <Breadcrumb
                items={[
                  {
                    label: locale === 'de' ? 'Startseite' : 'Home',
                    href: `/?lang=${locale}`,
                  },
                  {
                    label: category && currentCategoryLabel ? currentCategoryLabel : locale === 'de' ? 'Alle Beiträge' : 'All Posts',
                  },
                ]}
                locale={locale}
              />
              {category && (
                <Link
                  href={`/all_posts${locale ? `?lang=${locale}` : ''}`}
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <span>{locale === 'de' ? 'Alle Beiträge' : 'All Posts'}</span>
                </Link>
              )}
            </div>
          </div>
          {showSidebar && <div></div>}
        </div>

        {/* Category Filter - Show when showCategoryFilter is true */}
        {showCategoryFilter && uniqueCategories.length > 0 && (
          <CategoryFilter
            categories={uniqueCategories}
            activeCategory={currentCategory}
            locale={locale}
            getCategoryLabel={getCategoryLabel}
          />
        )}

        <div className={`grid grid-cols-1 ${showSidebar ? 'lg:grid-cols-3' : ''} gap-8 lg:gap-12`}>
          {/* Main Content Area */}
          <div className={`${showSidebar ? 'lg:col-span-2 space-y-12' : 'space-y-12'} posts-container`}>
            <AnimatedPostsGrid>
            {/* Featured Post (First Post) */}
            {featuredPost && (
              <FeaturedPostCard
                post={featuredPost}
                locale={locale}
                href={getPostLink(featuredPost, locale)}
                getImageUrl={getImageUrl}
                formatDate={formatDate}
                variant="category-page"
              />
            )}

            {/* Other Posts Grid */}
            {otherPosts.length > 0 && (
              <div>
                {!allPostsAsCards && (
                  <div className="flex items-center space-x-4 mb-8">
                    <div className="h-px bg-gradient-to-r from-red-600 to-transparent flex-1"></div>
                    <h3 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tight">
                      {locale === 'de' ? 'Weitere Beiträge' : 'More Posts'}
                    </h3>
                    <div className="h-px bg-gradient-to-l from-red-600 to-transparent flex-1"></div>
                  </div>
                )}
                <div className={`grid grid-cols-1 ${allPostsAsCards ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2'} gap-6 md:gap-8`}>
                  {otherPosts.map((post, index) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      locale={locale}
                      href={getPostLink(post, locale)}
                      getImageUrl={getImageUrl}
                      formatDate={formatDate}
                      variant="category-page"
                      index={index}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {posts.length === 0 && (
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
                    {category
                      ? locale === 'de'
                        ? `Es wurden keine Beiträge in der Kategorie "${currentCategoryLabel}" gefunden.`
                        : `No posts found in category "${currentCategoryLabel}".`
                      : locale === 'de'
                        ? 'Es sind noch keine Beiträge verfügbar.'
                        : 'No posts are available yet.'}
                  </p>
                  {category && (
                    <Link
                      href={`/all_posts${locale ? `?lang=${locale}` : ''}`}
                      className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-600 to-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-red-500 hover:to-red-400 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <span>{locale === 'de' ? 'Alle Beiträge anzeigen' : 'View All Posts'}</span>
                      <ArrowIcon direction="right" className="w-5 h-5" />
                    </Link>
                  )}
                </div>
              </div>
            )}
            </AnimatedPostsGrid>
          </div>

          {/* Sidebar - 1 column */}
          {showSidebar && (
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-8 space-y-6">
              {/* Categories Widget */}
              <div className="group relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100/50 hover:shadow-red-500/10 transition-all duration-700">
                {/* Header */}
                <div className="relative bg-fire px-6 py-6 shadow-xl">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md border border-white/20 shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-white text-xl font-black uppercase tracking-wider">
                      {locale === 'de' ? 'Kategorien' : 'Categories'}
                    </h3>
                  </div>
                </div>

                {/* Content */}
                <div className="relative p-6 bg-white">
                  <CategorySearch categories={uniqueCategories} locale={locale} activeCategory={activeCategoryForSearch} />
                </div>
              </div>

              {/* Facebook Widget */}
              {process.env.NEXT_PUBLIC_FACEBOOK_PAGE_URL && (
                <div className="group relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100/50 hover:shadow-red-500/10 transition-all duration-700">
                  {/* Animated gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-blue-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                  {/* Header */}
                  <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 px-6 py-6 shadow-xl">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md border border-white/20 shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      </div>
                      <h3 className="text-white text-xl font-black uppercase tracking-wider">
                        Facebook
                      </h3>
                    </div>
                  </div>

                  {/* Facebook Feed */}
                  <div className="relative p-4 bg-gradient-to-b from-white via-gray-50/50 to-white">
                    <div className="responsive-iframe-wrapper">
                      <iframe
                        src={`https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(
                          process.env.NEXT_PUBLIC_FACEBOOK_PAGE_URL || 'https://www.facebook.com/FreiwilligeFeuerwehrDross',
                        )}&tabs=timeline&width=340&height=500&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId`}
                        title="Facebook Feed"
                        allow="encrypted-media"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Back to Home Link */}
              <Link
                href="/"
                className="group block relative bg-fire rounded-3xl shadow-2xl overflow-hidden border border-red-500/30 hover:shadow-red-500/30 transition-all duration-700 transform hover:-translate-y-2 hover:scale-[1.02]"
              >
                
                <div className="relative p-8 text-center">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 group-hover:bg-white/20 transition-all duration-300">
                      <svg className="w-8 h-8 text-white transform group-hover:-translate-y-1 group-hover:scale-110 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                      </svg>
                    </div>
                    <span className="text-xl font-black text-white uppercase tracking-wider">{locale === 'de' ? 'Zur Startseite' : 'Back to Home'}</span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
          )}
        </div>
      </div>
    </section>
  )
}

