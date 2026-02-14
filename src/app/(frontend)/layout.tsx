import React, { Suspense } from 'react'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import './styles.css'
import AlertTopBar from '../../components/common/AlertTopBar'
import CookieBanner from '../../components/common/CookieBanner'
import SharedDataProvider from '../../components/common/SharedDataProvider'
import type { Category, ContactInfo, SiteSetting, Media, Page } from '@/payload-types'

function getFaviconUrl(favicon: SiteSetting['favicon']): string | undefined {
  if (!favicon) {
    return undefined
  }

  if (typeof favicon === 'number') {
    return undefined
  }

  if (typeof favicon === 'object' && favicon !== null) {
    const media = favicon as Media

    if (media.url && typeof media.url === 'string' && media.url.trim()) {
      return media.url
    }

    if (media.filename && typeof media.filename === 'string') {
      return `/media/${media.filename}`
    }
  }

  return undefined
}

export async function generateMetadata() {
  const locale = await getLocaleFromCookies()
  let siteSettings: SiteSetting | null = null

  try {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    try {
      siteSettings = await payload.findGlobal({
        slug: 'site-settings',
        locale,
        depth: 1,
      })
    } catch (error) {
      console.error('Error fetching site settings in metadata:', error)
    }
  } catch (error) {
    console.error('Error initializing Payload in metadata:', error)
  }

  const faviconUrl = siteSettings?.favicon ? getFaviconUrl(siteSettings.favicon) : undefined
  const siteTitle = siteSettings?.siteName || 'Site Title'

  return {
    title: {
      template: `%s | ${siteTitle}`,
      default: siteTitle,
    },
    description: siteSettings?.siteDescription || '',
    icons: faviconUrl
      ? {
          icon: faviconUrl,
          shortcut: faviconUrl,
          apple: faviconUrl,
        }
      : undefined,
  }
}

async function getLocaleFromCookies(): Promise<'en' | 'de'> {
  const headersList = await headers()
  const cookieHeader = headersList.get('cookie') || ''
  const match = cookieHeader.match(/(^| )locale=([^;]+)/)
  if (match) {
    const locale = decodeURIComponent(match[2])
    if (locale === 'en' || locale === 'de') {
      return locale
    }
  }
  return 'de'
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  const locale = await getLocaleFromCookies()

  let categories: Category[] = []
  let contactInfo: ContactInfo | null = null
  let siteSettings: SiteSetting | null = null
  let pages: Page[] = []

  try {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

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
        locale,
      })
      categories = categoriesResult.docs || []
    } catch (error) {
      console.error('Error fetching categories in layout:', error)
    }

    try {
      contactInfo = await payload.findGlobal({
        slug: 'contact-info',
        locale,
      })
    } catch (error) {
      console.error('Error fetching contact info in layout:', error)
    }

    try {
      siteSettings = await payload.findGlobal({
        slug: 'site-settings',
        locale,
        depth: 1,
      })
    } catch (error) {
      console.error('Error fetching site settings in layout:', error)
    }

    try {
      const pagesResult = await payload.find({
        collection: 'pages',
        where: {
          _status: {
            equals: 'published',
          },
        },
        limit: 100,
        sort: 'title',
        locale,
      })
      pages = pagesResult.docs || []
    } catch (error) {
      console.error('Error fetching pages in layout:', error)
    }
  } catch (error) {
    console.error('Error initializing Payload in layout:', error)
  }

  const getFaviconUrlFromSettings = (favicon: SiteSetting['favicon']): string | null => {
    if (!favicon) {
      return null
    }

    if (typeof favicon === 'number') {
      return null
    }

    if (typeof favicon === 'object' && favicon !== null) {
      const media = favicon as Media

      if (media.url && typeof media.url === 'string' && media.url.trim()) {
        return media.url
      }

      if (media.filename && typeof media.filename === 'string') {
        return `/media/${media.filename}`
      }
    }

    return null
  }

  const faviconUrl = siteSettings?.favicon ? getFaviconUrlFromSettings(siteSettings.favicon) : null

  return (
    <html lang={locale}>
      <head>
        {faviconUrl && (
          <>
            <link rel="icon" href={faviconUrl} />
            <link rel="shortcut icon" href={faviconUrl} />
            <link rel="apple-touch-icon" href={faviconUrl} />
          </>
        )}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">
        <SharedDataProvider
          initialCategories={categories}
          initialContactInfo={contactInfo}
          initialSiteSettings={siteSettings}
          initialPages={pages}
          initialLocale={locale}
        >
          <Suspense fallback={null}>
            <AlertTopBar />
          </Suspense>
          <main className="bg-white frontend-main">{children}</main>
          <Suspense fallback={null}>
            <CookieBanner />
          </Suspense>
        </SharedDataProvider>
      </body>
    </html>
  )
}
