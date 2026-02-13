import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import config from '@/payload.config'
import { getPayloadWithRetry } from '@/lib/getPayloadWithRetry'
import type { Page } from '@/payload-types'
import Navigation from '@/components/common/Navigation'
import FireBrigadeFooter from '@/components/common/FireBrigadeFooter'
import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ lang?: string }>
}

export default async function PagePage({ params, searchParams }: Props) {
  const { slug } = await params
  const searchParamsResolved = await searchParams
  const locale = (searchParamsResolved.lang === 'en' || searchParamsResolved.lang === 'de' ? searchParamsResolved.lang : 'de') as 'en' | 'de'

  const payloadConfig = await config
  const payload = await getPayloadWithRetry(payloadConfig, 3)

  // Try to find page by slug first, then by ID
  // Since slugs are localized, we need to search in both locales
  let page: Page | null = null

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
        
        // Log the error
        console.error(`Query attempt ${i + 1} failed:`, errorMessage, causeMessage ? `Cause: ${causeMessage}` : '')
        
        // If it's the last attempt, throw the error
        if (i === maxRetries - 1) {
          throw lastError
        }
        
        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
    throw lastError || new Error('Query failed after retries')
  }

  try {
    // First try to find by slug in the requested locale
    let slugResult = await retryQuery(async () => {
      return await payload.find({
        collection: 'pages',
        where: {
          and: [
            {
              slug: {
                equals: slug,
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
          collection: 'pages',
          where: {
            and: [
              {
                slug: {
                  equals: slug,
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
      page = slugResult.docs[0]
      // Re-fetch with the requested locale to get the correct localized content
      if (page.id) {
        const localizedPage = await retryQuery(async () => {
          return await payload.findByID({
            collection: 'pages',
            id: page!.id.toString(),
            depth: 2,
            locale,
          })
        })
        if (localizedPage && localizedPage._status === 'published') {
          page = localizedPage
        }
      }
    } else {
      // If not found by slug, try by ID (in case slug is actually an ID)
      const id = parseInt(slug, 10)
      if (!isNaN(id)) {
        const idResult = await retryQuery(async () => {
          return await payload.findByID({
            collection: 'pages',
            id: id.toString(),
            depth: 2,
            locale,
          })
        })

        // Check if it's published
        if (idResult && idResult._status === 'published') {
          page = idResult
        }
      }
    }
  } catch (error) {
    console.error('Error fetching page:', error)
  }

  if (!page) {
    notFound()
  }

  // Convert Lexical content to HTML
  let contentHtml = ''
  try {
    if (page.content && typeof page.content === 'object') {
      contentHtml = convertLexicalToHTML({
        data: page.content as Parameters<typeof convertLexicalToHTML>[0]['data'],
      })
    }
  } catch (error) {
    console.error('Error converting Lexical content to HTML:', error)
    // Fallback: extract text from Lexical JSON structure
    if (page.content && typeof page.content === 'object' && 'root' in page.content) {
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
      const extracted = extractText((page.content as { root: unknown }).root)
      contentHtml = extracted ? `<p>${extracted}</p>` : '<p>No content available.</p>'
    } else {
      contentHtml = '<p>No content available.</p>'
    }
  }

  return (
    <>
      <Suspense fallback={<div className="h-16 bg-fire" />}>
        <Navigation initialLocale={locale} />
      </Suspense>

      <article className="w-full bg-white min-h-screen">
        {/* Content Section */}
        <div className="w-full max-w-4xl mx-auto px-4 md:px-8 lg:px-12 py-12 md:py-16">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              {page.title}
            </h1>
          </div>

          {/* Rich Text Content */}
          <div
            className="max-w-none text-lg [&_h1]:text-4xl [&_h1]:mt-8 [&_h1]:mb-4 [&_h1]:font-bold [&_h1]:text-gray-900 [&_h2]:text-3xl [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:font-bold [&_h2]:text-gray-900 [&_h3]:text-2xl [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:font-bold [&_h3]:text-gray-900 [&_h4]:text-xl [&_h4]:mt-4 [&_h4]:mb-2 [&_h4]:font-bold [&_h4]:text-gray-900 [&_h5]:text-lg [&_h5]:mt-3 [&_h5]:mb-2 [&_h5]:font-bold [&_h5]:text-gray-900 [&_h6]:text-base [&_h6]:mt-2 [&_h6]:mb-1 [&_h6]:font-bold [&_h6]:text-gray-900 [&_p]:text-gray-700 [&_p]:mb-4 [&_a]:text-red-600 [&_a]:no-underline hover:[&_a]:text-red-500 [&_strong]:text-gray-900 [&_strong]:font-semibold [&_ul]:text-gray-700 [&_ol]:text-gray-700 [&_li]:my-2"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </div>
      </article>

      <FireBrigadeFooter initialLocale={locale} />
    </>
  )
}

