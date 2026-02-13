import React from 'react'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@/payload.config'
import type { Post, Media, Category } from '@/payload-types'
import CategorySearch from './CategorySearch'
import { getCategoryLabel, getCategoryPath, getActiveCategories } from '@/lib/categories'
import FeaturedPostCard from '@/components/news/FeaturedPostCard'
import PostCard from '@/components/news/PostCard'
import PostListItem from '@/components/news/PostListItem'
import ArrowIcon from '@/components/common/ArrowIcon'

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

function getPostLink(post: Post | null | undefined, locale: 'en' | 'de' = 'de', categoryMap?: Map<number, Category>): string {
  // Safety check: if post is undefined or null, return a fallback path
  if (!post || typeof post !== 'object') {
    return `/news${locale ? `?lang=${locale}` : ''}`
  }

  try {
    let categoryPath = 'news'
    
    if (post.category) {
      if (typeof post.category === 'number') {
        // Category is just an ID - try to get from map
        if (categoryMap && categoryMap.has(post.category)) {
          const category = categoryMap.get(post.category)
          if (category) {
            categoryPath = getCategoryPath(category, locale)
          } else {
            // Fallback to 'news' if category not found
            categoryPath = 'news'
          }
        } else {
          // Fallback to 'news' if category not found
          categoryPath = 'news'
        }
      } else {
        // Category is populated - ensure it's a valid object
        if (post.category && typeof post.category === 'object') {
          categoryPath = getCategoryPath(post.category, locale)
        } else {
          categoryPath = 'news'
        }
      }
    }
    
    // Handle localized slug - it might be a string or an object
    // Use optional chaining to safely access slug
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
    const postId = ('id' in post && post.id) ? post.id : 'post'
    return `/${categoryPath}/${postId}${locale ? `?lang=${locale}` : ''}`
  } catch (error) {
    console.error('Error generating post link:', error, post)
    return `/news${locale ? `?lang=${locale}` : ''}`
  }
}

interface NewsWithSidebarSectionProps {
  locale?: 'en' | 'de'
}

export default async function NewsWithSidebarSection({ locale = 'de' }: NewsWithSidebarSectionProps) {
  let posts: Post[] = []
  let payload: any = null
  
  try {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })

    // Fetch published posts with reduced depth to avoid relationship population issues
    // We'll fetch categories separately to have better control
    try {
      const postsResult = await payload.find({
        collection: 'posts',
        where: {
          _status: {
            equals: 'published',
          },
        },
        limit: 10,
        depth: 1, // Reduced from 2 - only populate featuredImage and author, not category
        sort: '-publishedDate',
        locale, // Use the locale from props
      })
      posts = postsResult.docs || []
    } catch (error) {
      console.error('Error fetching posts in NewsWithSidebarSection:', error)
      posts = []
    }
  } catch (error) {
    console.error('Error initializing Payload in NewsWithSidebarSection:', error)
    posts = []
  }

  // If payload initialization failed, return early
  if (!payload) {
    return (
      <section className="w-full bg-white py-16 md:py-20">
        <div className="w-full max-w-[1170px] mx-auto px-4 md:px-8 lg:px-12">
          <div className="text-center py-12">
            <p className="text-gray-600">
              {locale === 'de' ? 'Fehler beim Laden der Beiträge.' : 'Error loading posts.'}
            </p>
          </div>
        </div>
      </section>
    )
  }

  // Get all category IDs from posts (including those that might not be populated)
  const categoryIds = new Set<number>()
  posts.forEach((post) => {
    if (post.category) {
      const categoryId = typeof post.category === 'number' ? post.category : post.category.id
      if (categoryId) categoryIds.add(categoryId)
    }
  })

  // Fetch categories used in posts to create a map for link generation
  const categoryMap = new Map<number, Category>()
  if (categoryIds.size > 0) {
    try {
      const categoriesResult = await payload.find({
        collection: 'categories',
        where: {
          id: {
            in: Array.from(categoryIds),
          },
        },
        limit: 100,
        locale,
      })
      categoriesResult.docs.forEach((cat: any) => {
        // Only add valid categories with required properties
        if (cat && typeof cat === 'object' && 'id' in cat && cat.id) {
          categoryMap.set(cat.id, cat as Category)
        }
      })
    } catch (error) {
      console.error('Error fetching categories for posts:', error)
    }
  }

  // Populate category objects in posts if they're just IDs
  // Filter out any undefined/null posts as a safety measure
  const postsWithCategories = posts
    .filter((post): post is Post => post != null)
    .map((post) => {
      if (post.category && typeof post.category === 'number' && categoryMap.has(post.category)) {
        const category = categoryMap.get(post.category)
        if (category) {
          return {
            ...post,
            category,
          }
        }
      }
      return post
    })

  // Fetch all active categories for sidebar (not just ones from posts)
  // This shows all available categories to users
  let uniqueCategories: Category[] = []
  try {
    const categoriesResult = await payload.find({
      collection: 'categories',
      where: {
        active: {
          equals: true,
        },
      },
      limit: 100,
      sort: 'name',
      locale, // Important: pass locale to get localized fields
    })
    // Filter out any invalid categories
    uniqueCategories = categoriesResult.docs.filter(
      (cat: any): cat is Category => cat != null && typeof cat === 'object' && 'id' in cat && cat.id != null
    ) as Category[]
  } catch (error) {
    console.error('Error fetching categories:', error)
    // Fallback: use categories from map, but filter invalid ones
    uniqueCategories = Array.from(categoryMap.values()).filter(
      (cat): cat is Category => cat != null && typeof cat === 'object' && 'id' in cat && cat.id != null
    )
  }

  // Fetch sidebar widgets from CMS
  const sidebarWidgets = await payload.findGlobal({
    slug: 'sidebar-widgets',
    locale,
  })

  const featuredPost = postsWithCategories[0]
  const cardPosts = postsWithCategories.slice(1, 5) // Next 4 posts for cards
  const listPosts = postsWithCategories.slice(5, 10) // Remaining posts for list

  return (
    <section className="w-full bg-white py-16 md:py-20">
      <div className="w-full max-w-[1170px] mx-auto px-4 md:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Main News Content Area - 2 columns */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-red-600 mb-2">
                    {locale === 'de' ? 'AKTUELLES' : 'CURRENT NEWS'}
                  </h2>
                  <div className="w-20 h-1 bg-gradient-to-r from-red-600 to-red-500 rounded-full"></div>
                </div>
                <Link
                  href={`/all_posts${locale ? `?lang=${locale}` : ''}`}
                  className="text-sm font-semibold text-red-600 hover:text-red-500 transition-colors flex items-center space-x-1"
                >
                  <span>{locale === 'de' ? 'Alle anzeigen' : 'View All'}</span>
                  <ArrowIcon direction="right" className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Featured Article - Large Card */}
            {featuredPost && (
              <FeaturedPostCard
                post={featuredPost}
                locale={locale}
                href={getPostLink(featuredPost, locale, categoryMap)}
                getImageUrl={getImageUrl}
                formatDate={formatDate}
                variant="default"
              />
            )}

            {/* 4 Card Posts */}
            {cardPosts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {cardPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    locale={locale}
                    href={getPostLink(post, locale, categoryMap)}
                    getImageUrl={getImageUrl}
                    formatDate={formatDate}
                    variant="default"
                  />
                ))}
              </div>
            )}

            {/* Remaining News Articles - List Layout */}
            {listPosts.length > 0 && (
              <div className="space-y-4">
                {listPosts.map((post) => (
                  <PostListItem
                    key={post.id}
                    post={post}
                    locale={locale}
                    href={getPostLink(post, locale, categoryMap)}
                    getImageUrl={getImageUrl}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            )}

            {postsWithCategories.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600">
                  {locale === 'de' ? 'Noch keine Beiträge verfügbar.' : 'No posts available yet.'}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar - 1 column */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-4 md:space-y-6">
              {/* Categories Widget */}
              <div className="group relative bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-500">

                <div className="relative bg-fire px-6 py-5 shadow-lg">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                    <h3 className="text-white text-lg font-bold uppercase tracking-wide">Kategorien</h3>
                  </div>
                </div>

                <div className="relative p-6">
                  <CategorySearch categories={uniqueCategories} locale={locale} />
                </div>
              </div>

              {/* Social Widgets: Facebook & Instagram */}
              {(sidebarWidgets?.facebook?.enabled && sidebarWidgets?.facebook?.pageUrl) ||
              (sidebarWidgets?.instagram?.enabled && sidebarWidgets?.instagram?.username) ? (
                <div className="space-y-4 md:space-y-0 md:flex md:flex-row md:gap-6 lg:flex-col lg:space-y-6 lg:gap-0 xl:flex-col xl:space-y-6 xl:gap-0">
                  {/* Facebook Widget */}
                  {sidebarWidgets?.facebook?.enabled && sidebarWidgets?.facebook?.pageUrl && (
                    <div className="w-full md:w-1/2 lg:w-full xl:w-full group relative bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-500">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      <div className="relative bg-gradient-to-r from-blue-600 via-blue-600 to-blue-700 px-6 py-5 shadow-lg">
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                          </svg>
                          <h3 className="text-white text-lg font-bold uppercase tracking-wide">Facebook</h3>
                        </div>
                      </div>

                      {/* Facebook Feed */}
                      <div className="relative p-4 pb-2 md:pb-4 bg-gradient-to-b from-white via-gray-50/50 to-white">
                        <div className="facebook-iframe-wrapper">
                          <iframe
                            src={`https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(
                              sidebarWidgets.facebook.pageUrl,
                            )}&tabs=timeline&width=500&height=500&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId`}
                            title="Facebook Feed"
                            allow="encrypted-media"
                            className="w-full border-0"
                            scrolling="no"
                            style={{ minHeight: '400px' }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Instagram Widget */}
                  {sidebarWidgets?.instagram?.enabled && sidebarWidgets?.instagram?.username && (
                    <div className="w-full md:w-1/2 lg:w-full xl:w-full group relative bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-500">
                      <div className="absolute inset-0 bg-gradient-to-br from-pink-50/50 via-purple-50/50 to-orange-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 px-6 py-5 shadow-lg">
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                          </svg>
                          <h3 className="text-white text-lg font-bold uppercase tracking-wide">Instagram</h3>
                        </div>
                      </div>

                      {/* Instagram Feed */}
                      <div className="relative p-4 pb-2 md:pb-4">
                        <div className="responsive-iframe-wrapper">
                          <iframe
                            src={`https://www.instagram.com/${sidebarWidgets.instagram.username}/embed`}
                            title={`Instagram Feed - ${sidebarWidgets.instagram.username}`}
                            allow="encrypted-media"
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
