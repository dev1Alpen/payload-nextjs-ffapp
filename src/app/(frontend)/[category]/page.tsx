import { Suspense } from 'react'
import Navigation from '@/components/common/Navigation'
import FireBrigadeFooter from '@/components/common/FireBrigadeFooter'
import NewsCategoryPage from '@/components/news/NewsCategoryPage'

type Props = {
  params: Promise<{ category: string }>
  searchParams: Promise<{ lang?: string; category?: string }>
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category: categoryPath } = await params
  const searchParamsResolved = await searchParams
  const locale = (searchParamsResolved.lang === 'en' || searchParamsResolved.lang === 'de' ? searchParamsResolved.lang : 'de') as 'en' | 'de'
  
  // Pass the category slug from URL path, or use query parameter as fallback
  // NewsCategoryPage will handle looking up the category by slug
  const category = categoryPath || searchParamsResolved.category || null

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


