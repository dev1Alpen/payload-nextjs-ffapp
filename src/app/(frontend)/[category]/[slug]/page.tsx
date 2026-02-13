import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import config from '@/payload.config'
import { getPayloadWithRetry } from '@/lib/getPayloadWithRetry'
import type { Post, Media, User, Category } from '@/payload-types'
import Navigation from '@/components/common/Navigation'
import FireBrigadeFooter from '@/components/common/FireBrigadeFooter'
import ArrowIcon from '@/components/common/ArrowIcon'
import PostGallery from '@/components/news/PostGallery'
import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'
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

function getAuthorName(author: User | number | null | undefined): string {
  if (!author) return 'Unknown'
  if (typeof author === 'number') return 'Unknown'
  return author.email || 'Unknown'
}


type Props = {
  params: Promise<{ category: string; slug: string }>
  searchParams: Promise<{ lang?: string }>
}

export async function generateMetadata({ params, searchParams }: Props) {
  const { category: categoryPath, slug } = await params
  const searchParamsResolved = await searchParams
  const locale = (searchParamsResolved.lang === 'en' || searchParamsResolved.lang === 'de' ? searchParamsResolved.lang : 'de') as 'en' | 'de'

  const payloadConfig = await config
  const payload = await getPayloadWithRetry(payloadConfig, 3)

  // Find category by slug
  let category: Category | null = null
  try {
    const categoryResult = await payload.find({
      collection: 'categories',
      where: {
        or: [
          { 'slug.en': { equals: categoryPath } },
          { 'slug.de': { equals: categoryPath } },
        ],
      },
      limit: 1,
      locale,
    })
    if (categoryResult.docs.length > 0) {
      category = categoryResult.docs[0] as Category
    }
  } catch (error) {
    console.error('Error finding category for metadata:', error)
  }

  if (!category) {
    return {
      title: 'Post',
    }
  }

  const categoryId = category.id

  // Try to find post by slug
  let post: Post | null = null

  try {
    const slugResult = await payload.find({
      collection: 'posts',
      where: {
        and: [
          {
            slug: {
              equals: slug,
            },
          },
          {
            category: {
              equals: categoryId,
            },
          },
          {
            _status: {
              equals: 'published',
            },
          },
        ],
      },
      limit: 1,
      depth: 0,
      locale,
    })

    if (slugResult.docs.length > 0) {
      post = slugResult.docs[0]
    } else {
      // Try fallback locale
      const fallbackLocale = locale === 'de' ? 'en' : 'de'
      const fallbackResult = await payload.find({
        collection: 'posts',
        where: {
          and: [
            {
              slug: {
                equals: slug,
              },
            },
            {
              category: {
                equals: categoryId,
              },
            },
            {
              _status: {
                equals: 'published',
              },
            },
          ],
        },
        limit: 1,
        depth: 0,
        locale: fallbackLocale,
      })

      if (fallbackResult.docs.length > 0) {
        post = fallbackResult.docs[0]
      }
    }
  } catch (error) {
    console.error('Error fetching post for metadata:', error)
  }

  // Get title from meta or fallback to post title
  const getLocalizedValue = (value: unknown, locale: 'en' | 'de', fallback: string = ''): string => {
    if (typeof value === 'string') {
      return value
    }
    if (typeof value === 'object' && value !== null) {
      const obj = value as Record<string, string>
      return obj[locale] || obj.de || obj.en || fallback
    }
    return fallback
  }

  const postTitle = post ? getLocalizedValue(post.title, locale, '') : ''
  const metaTitle = post?.meta?.metaTitle
    ? getLocalizedValue(post.meta.metaTitle, locale, postTitle)
    : postTitle

  const metaDescription = post?.meta?.metaDescription
    ? getLocalizedValue(post.meta.metaDescription, locale, '')
    : ''

  return {
    title: metaTitle || postTitle || 'Post',
    description: metaDescription || undefined,
  }
}

export default async function PostPage({ params, searchParams }: Props) {
  const { category: categoryPath, slug } = await params
  const searchParamsResolved = await searchParams
  const locale = (searchParamsResolved.lang === 'en' || searchParamsResolved.lang === 'de' ? searchParamsResolved.lang : 'de') as 'en' | 'de'

  const payloadConfig = await config
  const payload = await getPayloadWithRetry(payloadConfig, 3)

  // Find category by slug (categoryPath from URL)
  let category: Category | null = null
  try {
    const categoryResult = await payload.find({
      collection: 'categories',
      where: {
        or: [
          { 'slug.en': { equals: categoryPath } },
          { 'slug.de': { equals: categoryPath } },
        ],
      },
      limit: 1,
      locale,
    })
    if (categoryResult.docs.length > 0) {
      category = categoryResult.docs[0] as Category
    }
  } catch (error) {
    console.error('Error finding category:', error)
  }

  if (!category) {
    notFound()
  }

  const categoryId = category.id

  // Try to find post by slug first, then by ID
  // Since slugs are localized, we need to search in both locales
  let post: Post | null = null

  // Helper function to retry database queries
  async function retryQuery<T>(
    queryFn: () => Promise<T>,
    maxRetries = 3,
    delay = 1000
  ): Promise<T> {
    let lastError: Error | null = null
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await queryFn()
      } catch (error: unknown) {
        lastError = error instanceof Error ? error : new Error(String(error))
        const errorMessage = error instanceof Error ? error.message : String(error)
        const causeMessage = error instanceof Error && error.cause instanceof Error ? error.cause.message : ''
        if (
          (errorMessage.includes('timeout') || 
           errorMessage.includes('connection slots') ||
           causeMessage.includes('timeout')) &&
          i < maxRetries - 1
        ) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
          continue
        }
        throw error
      }
    }
    throw lastError || new Error('Query failed after retries')
  }

  try {
    // First try to find by slug in the requested locale
    let slugResult = await retryQuery(async () => {
      return await payload.find({
        collection: 'posts',
        where: {
          and: [
            {
              slug: {
                equals: slug,
              },
            },
            {
              category: {
                equals: categoryId,
              },
            },
            {
              _status: {
                equals: 'published',
              },
            },
          ],
        },
        limit: 1,
        depth: 2,
        locale,
      })
    })

    // If not found in requested locale, try the other locale
    if (slugResult.docs.length === 0) {
      const fallbackLocale = locale === 'de' ? 'en' : 'de'
      slugResult = await retryQuery(async () => {
        return await payload.find({
          collection: 'posts',
          where: {
            and: [
              {
                slug: {
                  equals: slug,
                },
              },
              {
                category: {
                  equals: category,
                },
              },
              {
                _status: {
                  equals: 'published',
                },
              },
            ],
          },
          limit: 1,
          depth: 2,
          locale: fallbackLocale,
        })
      })
    }

    if (slugResult.docs.length > 0) {
      post = slugResult.docs[0]
      // Re-fetch with the requested locale to get the correct localized content
      if (post.id) {
        const localizedPost = await retryQuery(async () => {
          return await payload.findByID({
            collection: 'posts',
            id: post!.id.toString(),
            depth: 2,
            locale,
          })
        })
        if (localizedPost && localizedPost._status === 'published') {
          post = localizedPost
        }
      }
    } else {
      // If not found by slug, try by ID (in case slug is actually an ID)
      const id = parseInt(slug, 10)
      if (!isNaN(id)) {
        const idResult = await retryQuery(async () => {
          return await payload.findByID({
            collection: 'posts',
            id: id.toString(),
            depth: 2,
            locale,
          })
        })

        // Check if it's published and matches the category
        if (idResult && idResult._status === 'published' && idResult.category === category) {
          post = idResult
        }
      }
    }
  } catch (error) {
    console.error('Error fetching post:', error)
  }

  if (!post) {
    notFound()
  }

  // Convert Lexical content to HTML
  let contentHtml = ''
  try {
    if (post.content && typeof post.content === 'object') {
      contentHtml = convertLexicalToHTML({
        data: post.content as Parameters<typeof convertLexicalToHTML>[0]['data'],
      })
    }
  } catch (error) {
    console.error('Error converting Lexical content to HTML:', error)
    // Fallback: extract text from Lexical JSON structure
    if (post.content && typeof post.content === 'object' && 'root' in post.content) {
      const extractText = (node: unknown): string => {
        if (typeof node === 'string') return node
        if (node && typeof node === 'object' && 'text' in node) {
          return String((node as { text: string }).text)
        }
        if (node && typeof node === 'object' && 'children' in node && Array.isArray((node as { children: unknown[] }).children)) {
          return (node as { children: unknown[] }).children.map(extractText).join('')
        }
        return ''
      }
      const extracted = extractText((post.content as { root: unknown }).root)
      contentHtml = extracted ? `<p>${extracted}</p>` : '<p>No content available.</p>'
    } else {
      contentHtml = '<p>No content available.</p>'
    }
  }

  // Helper function to generate post link
  const getPostLink = (postItem: Post): string => {
    const postCategoryPath = postItem.category && typeof postItem.category !== 'number'
      ? getCategoryPath(postItem.category, locale)
      : 'news'
    if (postItem.slug) {
      return `/${postCategoryPath}/${postItem.slug}${locale ? `?lang=${locale}` : ''}`
    }
    return `/${postCategoryPath}/${postItem.id}${locale ? `?lang=${locale}` : ''}`
  }

  // Fetch previous and next posts in the same category
  let previousPost: Post | null = null
  let nextPost: Post | null = null

  try {
    const currentDate = post.publishedDate || post.createdAt

    // Get previous post (older, published before current)
    const previousResult = await retryQuery(async () => {
      return await payload.find({
        collection: 'posts',
        where: {
          and: [
            {
              category: {
                equals: categoryId,
              },
            },
            {
              _status: {
                equals: 'published',
              },
            },
            {
              or: [
                {
                  publishedDate: {
                    less_than: currentDate,
                  },
                },
                {
                  and: [
                    {
                      publishedDate: {
                        exists: false,
                      },
                    },
                    {
                      createdAt: {
                        less_than: currentDate,
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        limit: 1,
        depth: 1,
        sort: '-publishedDate',
        locale,
      })
    })

    if (previousResult.docs.length > 0) {
      previousPost = previousResult.docs[0]
    }

    // Get next post (newer, published after current)
    const nextResult = await retryQuery(async () => {
      return await payload.find({
        collection: 'posts',
        where: {
          and: [
            {
              category: {
                equals: categoryId,
              },
            },
            {
              _status: {
                equals: 'published',
              },
            },
            {
              or: [
                {
                  publishedDate: {
                    greater_than: currentDate,
                  },
                },
                {
                  and: [
                    {
                      publishedDate: {
                        exists: false,
                      },
                    },
                    {
                      createdAt: {
                        greater_than: currentDate,
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        limit: 1,
        depth: 1,
        sort: 'publishedDate',
        locale,
      })
    })

    if (nextResult.docs.length > 0) {
      nextPost = nextResult.docs[0]
    }
  } catch (error) {
    console.error('Error fetching previous/next posts:', error)
    // Continue without navigation if there's an error
  }

  return (
    <>
      <Suspense fallback={<div className="h-16 bg-fire" />}>
        <Navigation initialLocale={locale} />
      </Suspense>

      <article className="w-full bg-white min-h-screen">
        {/* Hero Section with Featured Image as Background */}
        {post.featuredImage ? (
          <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px]">
            <Image
              src={getImageUrl(post.featuredImage)}
              alt={post.title || 'Post'}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 lg:p-12">
              <div className="max-w-4xl mx-auto">
                {post.category && (
                  <div className="mb-4">
                    <span className="bg-gradient-to-r from-red-600 to-red-500 text-white text-xs md:text-sm font-bold px-4 py-2 rounded-full uppercase tracking-wide shadow-lg inline-block">
                      {post.category && typeof post.category !== 'number' ? getCategoryLabel(post.category, locale) : ''}
                    </span>
                  </div>
                )}
                <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 leading-tight drop-shadow-lg">
                  {post.title}
                </h1>
                <div className="flex items-center space-x-4 text-white/90 text-sm md:text-base drop-shadow-md">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>{formatDate(post.publishedDate || post.createdAt)}</span>
                  </div>
                  {post.showAuthor && post.author && (
                    <>
                      <span className="text-white/60">•</span>
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        <span>{getAuthorName(post.author)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Content Section */}
        <div className="w-full max-w-4xl mx-auto px-4 md:px-8 lg:px-12 py-12 md:py-16">
          {/* Header (if no featured image) */}
          {!post.featuredImage && (
            <div className="mb-8">
              {post.category && (
                <div className="mb-4">
                  <span className="bg-gradient-to-r from-red-600 to-red-700 text-white text-xs md:text-sm font-bold px-4 py-2 rounded-full uppercase tracking-wide shadow-lg inline-block">
                    {getCategoryLabel(post.category, locale)}
                  </span>
                </div>
              )}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                {post.title}
              </h1>
              <div className="flex items-center space-x-4 text-gray-600 text-sm md:text-base">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>{formatDate(post.publishedDate || post.createdAt)}</span>
                </div>
                {post.showAuthor && post.author && (
                  <>
                    <span className="text-gray-400">•</span>
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span>{getAuthorName(post.author)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Rich Text Content */}
          <div
            className="max-w-none text-lg [&_h1]:text-4xl [&_h1]:mt-8 [&_h1]:mb-4 [&_h1]:font-bold [&_h1]:text-gray-900 [&_h2]:text-3xl [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:font-bold [&_h2]:text-gray-900 [&_h3]:text-2xl [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:font-bold [&_h3]:text-gray-900 [&_h4]:text-xl [&_h4]:mt-4 [&_h4]:mb-2 [&_h4]:font-bold [&_h4]:text-gray-900 [&_h5]:text-lg [&_h5]:mt-3 [&_h5]:mb-2 [&_h5]:font-bold [&_h5]:text-gray-900 [&_h6]:text-base [&_h6]:mt-2 [&_h6]:mb-1 [&_h6]:font-bold [&_h6]:text-gray-900 [&_p]:text-gray-700 [&_p]:mb-4 [&_a]:text-red-600 [&_a]:no-underline hover:[&_a]:text-red-500 [&_strong]:text-gray-900 [&_strong]:font-semibold [&_ul]:text-gray-700 [&_ol]:text-gray-700 [&_li]:my-2"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />

          {/* Gallery Section - Display if gallery images exist */}
          {post.galleryImages && Array.isArray(post.galleryImages) && post.galleryImages.length > 0 && (
            <div className="mt-12 pt-12 border-t border-gray-200">
              <PostGallery images={post.galleryImages} title={post.title || undefined} />
            </div>
          )}

          {/* Previous and Next Post Navigation */}
          {(previousPost || nextPost) && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Previous Post (Older) */}
                {previousPost && (
                  <Link
                    href={getPostLink(previousPost)}
                    className="group p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 hover:border-red-400"
                  >
                    <div className="flex items-center space-x-2 text-red-600 text-sm font-semibold mb-2">
                      <ArrowIcon direction="left" className="w-4 h-4" />
                      <span>{locale === 'de' ? 'Vorheriger Beitrag' : 'Previous Post'}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2">
                      {previousPost.title}
                    </h3>
                    {(previousPost.publishedDate || previousPost.createdAt) && (
                      <p className="text-sm text-gray-500 mt-2">
                        {formatDate(previousPost.publishedDate || previousPost.createdAt)}
                      </p>
                    )}
                  </Link>
                )}

                {/* Next Post (Newer) */}
                {nextPost && (
                  <Link
                    href={getPostLink(nextPost)}
                    className="group p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 hover:border-red-400 md:text-right"
                  >
                    <div className="flex items-center justify-end space-x-2 text-red-600 text-sm font-semibold mb-2">
                      <span>{locale === 'de' ? 'Nächster Beitrag' : 'Next Post'}</span>
                      <ArrowIcon direction="right" className="w-4 h-4" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2">
                      {nextPost.title}
                    </h3>
                    {(nextPost.publishedDate || nextPost.createdAt) && (
                      <p className="text-sm text-gray-500 mt-2">
                        {formatDate(nextPost.publishedDate || nextPost.createdAt)}
                      </p>
                    )}
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Back to Category Link */}
          <div className={`${previousPost || nextPost ? 'mt-6' : 'mt-12'} pt-8 border-t border-gray-200`}>
            <Link
              href={`/${getCategoryPath(category, locale)}${locale ? `?lang=${locale}` : ''}`}
              className="inline-flex items-center space-x-2 text-red-600 hover:text-red-500 font-semibold transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span>{locale === 'de' ? 'Zurück zur Kategorie' : 'Back to category'}</span>
            </Link>
          </div>
        </div>
      </article>

      <FireBrigadeFooter initialLocale={locale} />
    </>
  )
}

