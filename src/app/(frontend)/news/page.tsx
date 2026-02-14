import { Suspense } from 'react'
import Navigation from '@/components/common/Navigation'
import FireBrigadeFooter from '@/components/common/FireBrigadeFooter'
import NewsCategoryPage from '@/components/news/NewsCategoryPage'
import { getPayload } from 'payload'
import config from '@/payload.config'

type Props = {
  searchParams: Promise<{ category?: string; lang?: string }>
}

export default async function NewsPage({ searchParams }: Props) {
  const params = await searchParams
  const locale = (params.lang === 'en' || params.lang === 'de' ? params.lang : 'de') as 'en' | 'de'

  let category = params.category || null

  if (!category) {
    try {
      const payloadConfig = await config
      const payload = await getPayload({ config: payloadConfig })

      const categoryResult = await payload.find({
        collection: 'categories',
        where: {
          or: [
            { 'slug.en': { equals: 'news' } },
            { 'slug.de': { equals: 'news' } },
            { 'slug.de': { equals: 'aktuelles' } },
          ],
        },
        limit: 1,
        locale,
      })

      if (categoryResult.docs.length > 0) {
        category = categoryResult.docs[0].id.toString()
      }
    } catch (error) {
      console.error('Error finding news category:', error)
    }
  }

  return (
    <>
      <Suspense fallback={<div className="h-16 bg-fire" />}>
        <Navigation initialLocale={locale} />
      </Suspense>
      <NewsCategoryPage category={category} locale={locale} />
      <FireBrigadeFooter initialLocale={locale} />
    </>
  )
}
