import { Suspense } from 'react'
import { getPayload } from 'payload'
import config from '@/payload.config'
import Navigation from '@/components/common/Navigation'
import Gallery from '@/components/home/Gallery'
import FireBrigadeFooter from '@/components/common/FireBrigadeFooter'
import '../styles.css'

export async function generateMetadata() {
  return {
    title: 'Gallery - Dross Fire Department',
    description: 'Browse our collection of images, videos, and audio from the Dross Fire Department',
  }
}

type Props = {
  searchParams: Promise<{ lang?: string }>
}

export default async function GalleryPage({ searchParams }: Props) {
  const params = await searchParams
  const locale = (params.lang === 'en' || params.lang === 'de' ? params.lang : 'de') as 'en' | 'de'

  let galleryItems: any[] = []

  try {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    // Fetch gallery items from CMS
    // Need depth: 1 to populate media relationship
    try {
      const galleryResult = await payload.find({
        collection: 'gallery',
        sort: 'order',
        locale,
        depth: 1, // Populate media relationship
        limit: 200, // Get more items for the dedicated gallery page
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

