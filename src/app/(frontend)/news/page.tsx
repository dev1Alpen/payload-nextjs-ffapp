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
  
  // If no category in query params, detect from URL path (news = "news" category)
  let category = params.category || null
  if (!category) {
    // Try to find "news" category by slug
    try {
      const payloadConfig = await config
      const payload = await getPayload({ config: payloadConfig })
      const categoryResult = await payload.find({
        collection: 'categories',
        where: {
          or: [
            { 'slug.en': { equals: 'news' } },
            { 'slug.de': { equals: 'news' } },
          ],
        },
        limit: 1,
        locale,
      })
      if (categoryResult.docs.length > 0) {
        category = categoryResult.docs[0].id.toString() // Pass as string ID
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

