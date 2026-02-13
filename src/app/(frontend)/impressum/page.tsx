import { Suspense } from 'react'
import { getPayload } from 'payload'
import config from '@/payload.config'
import Navigation from '@/components/common/Navigation'
import FireBrigadeFooter from '@/components/common/FireBrigadeFooter'
import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'
import type { Impressum as ImpressumType } from '@/payload-types'

type Props = {
  searchParams: Promise<{ lang?: string }>
}

export default async function ImpressumPage({ searchParams }: Props) {
  const params = await searchParams
  const locale = (params.lang === 'en' || params.lang === 'de' ? params.lang : 'de') as 'en' | 'de'

  // Fetch impressum content from CMS
  let impressumData: ImpressumType | null = null

  try {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    // Fetch impressum content (should only be one record)
    try {
      const impressumResult = await payload.find({
        collection: 'impressum',
        where: {
          _status: {
            equals: 'published',
          },
        },
        limit: 1,
        locale,
        depth: 1,
        sort: '-createdAt',
      })
      if (impressumResult.docs.length > 0) {
        impressumData = impressumResult.docs[0]
      }
    } catch (error) {
      console.error('Error fetching impressum:', error)
    }
  } catch (error) {
    console.error('Error initializing Payload:', error)
  }

  // Helper function to extract localized string value
  const getLocalizedValue = (
    value: unknown,
    locale: 'en' | 'de',
    fallback: string = ''
  ): string => {
    if (typeof value === 'string') {
      return value
    }
    if (typeof value === 'object' && value !== null) {
      const obj = value as Record<string, string>
      return obj[locale] || obj.de || obj.en || fallback
    }
    return fallback
  }

  // Fallback translations if no CMS data
  const fallbackTranslations = {
    de: {
      title: 'Impressum',
      description: 'Angaben gemäß § 5 TMG',
      content: 'Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt.',
    },
    en: {
      title: 'Imprint',
      description: 'Information according to § 5 TMG',
      content: 'The contents of our pages have been created with the greatest care.',
    },
  }

  // Extract localized values
  const title = impressumData
    ? getLocalizedValue(impressumData.title, locale, fallbackTranslations[locale].title)
    : fallbackTranslations[locale].title

  const description = impressumData
    ? getLocalizedValue(impressumData.description, locale, fallbackTranslations[locale].description)
    : fallbackTranslations[locale].description

  // Convert content to HTML
  let contentHtml = ''
  try {
    if (impressumData?.content && typeof impressumData.content === 'object') {
      contentHtml = convertLexicalToHTML({
        data: impressumData.content as Parameters<typeof convertLexicalToHTML>[0]['data'],
      })
    }
  } catch (error) {
    console.error('Error converting Lexical content to HTML:', error)
    // Fallback: extract text from Lexical JSON structure
    if (impressumData?.content && typeof impressumData.content === 'object' && impressumData.content !== null && 'root' in impressumData.content) {
      const extractText = (node: unknown): string => {
        if (typeof node === 'string') return node
        if (node && typeof node === 'object' && node !== null && 'text' in node) {
          return String((node as { text: string }).text)
        }
        if (node && typeof node === 'object' && node !== null && 'children' in node && Array.isArray((node as { children: unknown[] }).children)) {
          return (node as { children: unknown[] }).children.map(extractText).join('')
        }
        return ''
      }
      const extracted = extractText((impressumData.content as { root: unknown }).root)
      contentHtml = extracted ? `<p>${extracted}</p>` : `<p>${fallbackTranslations[locale].content}</p>`
    } else {
      contentHtml = `<p>${fallbackTranslations[locale].content}</p>`
    }
  }

  // Ensure contentHtml is never empty
  if (!contentHtml || contentHtml.trim() === '') {
    contentHtml = `<p>${fallbackTranslations[locale].content}</p>`
  }

  return (
    <>
      <Suspense fallback={<div className="h-16 bg-fire" />}>
        <Navigation initialLocale={locale} />
      </Suspense>

      <article className="w-full bg-white min-h-screen">
        <div className="w-full max-w-4xl mx-auto px-4 md:px-8 lg:px-12 py-12 md:py-16">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 leading-tight">
              {title}
            </h1>
            {description && (
              <p className="text-lg text-gray-600">{description}</p>
            )}
          </div>

          {/* Main Content */}
          <div
            key={`impressum-content-${locale}`}
            className="max-w-none text-lg [&_h1]:text-4xl [&_h1]:mt-8 [&_h1]:mb-4 [&_h1]:font-bold [&_h1]:text-gray-900 [&_h2]:text-3xl [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:font-bold [&_h2]:text-gray-900 [&_h3]:text-2xl [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:font-bold [&_h3]:text-gray-900 [&_h4]:text-xl [&_h4]:mt-4 [&_h4]:mb-2 [&_h4]:font-bold [&_h4]:text-gray-900 [&_h5]:text-lg [&_h5]:mt-3 [&_h5]:mb-2 [&_h5]:font-bold [&_h5]:text-gray-900 [&_h6]:text-base [&_h6]:mt-2 [&_h6]:mb-1 [&_h6]:font-bold [&_h6]:text-gray-900 [&_p]:text-gray-700 [&_p]:mb-4 [&_a]:text-red-600 [&_a]:no-underline hover:[&_a]:text-red-500 [&_strong]:text-gray-900 [&_strong]:font-semibold [&_ul]:text-gray-700 [&_ol]:text-gray-700 [&_li]:my-2"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </div>
      </article>

      <FireBrigadeFooter initialLocale={locale} />
    </>
  )
}
