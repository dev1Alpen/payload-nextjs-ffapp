import { Suspense } from 'react'
import Navigation from '@/components/common/Navigation'
import FireBrigadeFooter from '@/components/common/FireBrigadeFooter'
import Breadcrumb from '@/components/common/Breadcrumb'
import AllPostsClient from '@/components/news/AllPostsClient'
import { getPayload } from 'payload'
import config from '@/payload.config'
import type { Post } from '@/payload-types'

type Props = {
  searchParams: Promise<{ lang?: string; category?: string; search?: string }>
}

export default async function AllPostsPage({ searchParams }: Props) {
  const params = await searchParams
  const locale = (params.lang === 'en' || params.lang === 'de' ? params.lang : 'de') as 'en' | 'de'
  const category = params.category || null
  const searchQuery = params.search || null

  // Fetch all posts once on server
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const { docs: allPosts } = await payload.find({
    collection: 'posts',
    where: {
      _status: {
        equals: 'published',
      },
    },
    limit: 100,
    depth: 1,
    sort: '-publishedDate',
    locale,
    select: {
      id: true,
      title: true,
      slug: true,
      category: true,
      featuredImage: true,
      publishedDate: true,
      createdAt: true,
    },
  })

  return (
    <>
      <Suspense fallback={<div className="h-16 bg-fire" />}>
        <Navigation initialLocale={locale} />
      </Suspense>
      <section className="w-full bg-white min-h-screen pb-16 md:pb-20">
        {/* Modern Hero Header Section */}
        <div className="relative bg-gradient-to-br from-gray-900 via-red-600 to-red-500 overflow-hidden">
          {/* Modern Geometric Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `linear-gradient(30deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%), linear-gradient(60deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)`,
              backgroundSize: '60px 60px',
            }}></div>
          </div>
          
          {/* Animated Gradient Orbs */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/30 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-600/30 rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-16 md:py-20">
            <div className="max-w-5xl">
              {/* Modern Category Badge */}
              <div className="flex items-center flex-wrap gap-4 mb-6">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl rounded-2xl px-5 py-2.5 border border-white/20 shadow-xl">
                  <div className="p-1.5 bg-white/20 rounded-xl">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <span className="text-white text-sm font-bold uppercase tracking-widest">
                    {locale === 'de' ? 'Alle Beiträge' : 'All Posts'}
                  </span>
                </div>
                {allPosts.length > 0 && (
                  <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10">
                    <svg className="w-4 h-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-white/90 text-sm font-semibold">
                      {allPosts.length} {allPosts.length === 1 ? (locale === 'de' ? 'Beitrag' : 'post') : locale === 'de' ? 'Beiträge' : 'posts'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 pt-6 md:pt-8">
          {/* Breadcrumbs */}
          <Breadcrumb
            items={[
              {
                label: locale === 'de' ? 'Startseite' : 'Home',
                href: `/?lang=${locale}`,
              },
              {
                label: locale === 'de' ? 'Alle Beiträge' : 'All Posts',
              },
            ]}
            locale={locale}
          />

          {/* Client-side filtered posts */}
          <AllPostsClient
            initialPosts={allPosts as Post[]}
            initialCategory={category}
            initialSearchQuery={searchQuery}
            locale={locale}
          />
        </div>
      </section>
      <FireBrigadeFooter initialLocale={locale} />
    </>
  )
}

