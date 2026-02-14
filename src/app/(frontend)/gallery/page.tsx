import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getPayload } from 'payload'
import config from '@/payload.config'
import Navigation from '@/components/common/Navigation'
import Gallery from '@/components/home/Gallery'
import FireBrigadeFooter from '@/components/common/FireBrigadeFooter'
import '../styles.css'

type Props = {
  searchParams: Promise<{ lang?: string }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams
  const locale = (params.lang === 'en' || params.lang === 'de' ? params.lang : 'de') as 'en' | 'de'

  let siteTitle = ''
  try {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })
    const siteSettings = await payload.findGlobal({
      slug: 'site-settings',
      locale,
    })
    siteTitle = (siteSettings as any)?.siteName || ''
  } catch {
    siteTitle = ''
  }

  const pageTitle = locale === 'de' ? 'Galerie' : 'Gallery'

  return {
    title: siteTitle ? `${pageTitle} | ${siteTitle}` : pageTitle,
  }
}

export default async function GalleryPage({ searchParams }: Props) {
  const params = await searchParams
  const locale = (params.lang === 'en' || params.lang === 'de' ? params.lang : 'de') as 'en' | 'de'

  let galleryItems: any[] = []

  try {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    try {
      const galleryResult = await payload.find({
        collection: 'gallery',
        sort: 'order',
        locale,
        depth: 1,
        limit: 200,
      })
      galleryItems = galleryResult.docs || []
    } catch (error) {
      console.error('Error fetching gallery items:', error)
    }
  } catch (error) {
    console.error('Error initializing Payload:', error)
  }

  return (
    <>
      <Suspense fallback={<div className="h-16 bg-fire" />}>
        <Navigation initialLocale={locale} />
      </Suspense>
      <div className="min-h-screen bg-gray-50">
        <Gallery items={galleryItems} locale={locale} />
      </div>
      <FireBrigadeFooter initialLocale={locale} />
    </>
  )
}
