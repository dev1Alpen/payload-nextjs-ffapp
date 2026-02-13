import { Suspense } from 'react'
import { getPayload } from 'payload'
import config from '@/payload.config'
import Navigation from '@/components/common/Navigation'
import MagazineSlider from '@/components/home/MagazineSlider'
import OurTasksClient from '@/components/home/OurTasksClient'
import NewsWithSidebarSection from '@/components/home/NewsWithSidebarSection'
import SponsorsSlider from '@/components/home/SponsorsSlider'
import FireBrigadeFooter from '@/components/common/FireBrigadeFooter'
import './styles.css'

type Props = {
  searchParams: Promise<{ lang?: string }>
}

export default async function HomePage({ searchParams }: Props) {
  const params = await searchParams
  const locale = (params.lang === 'en' || params.lang === 'de' ? params.lang : 'de') as 'en' | 'de'

  // Fetch tasks from CMS
  let tasks: any[] = []
  let sponsors: any[] = []
  let magazineSlides: any[] = []

  try {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    try {
      const tasksResult = await payload.find({
        collection: 'tasks',
        sort: 'order',
        locale,
        depth: 1, // Populate iconImage relationship
      })
      tasks = tasksResult.docs || []
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }

    try {
      const sponsorsResult = await payload.find({
        collection: 'sponsors',
        sort: 'order',
        locale,
        depth: 1, // Populate logo relationship
      })
      sponsors = sponsorsResult.docs || []
    } catch (error) {
      console.error('Error fetching sponsors:', error)
    }

    // Fetch magazine slides from CMS
    // Need depth: 1 to populate image relationship
    try {
      const slidesResult = await payload.find({
        collection: 'magazine-slides',
        sort: 'order',
        locale,
        depth: 1, // Populate image relationship
      })
      magazineSlides = slidesResult.docs || []
    } catch (error) {
      console.error('Error fetching magazine slides:', error)
    }
  } catch (error) {
    console.error('Error initializing Payload:', error)
  }

  return (
    <>
      <Suspense fallback={<div className="h-16 bg-fire" />}>
        <Navigation initialLocale={locale} />
      </Suspense>
      <MagazineSlider slides={magazineSlides} locale={locale} />
      <NewsWithSidebarSection locale={locale} />
      <OurTasksClient tasks={tasks} locale={locale} />
      <SponsorsSlider sponsors={sponsors} locale={locale} />
      <FireBrigadeFooter initialLocale={locale} />
    </>
  )
}
