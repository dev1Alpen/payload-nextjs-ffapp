import type { Metadata } from 'next'
import { Suspense, cache } from 'react'
import Image from 'next/image'
import { getPayload } from 'payload'
import config from '@/payload.config'
import Navigation from '@/components/common/Navigation'
import FireBrigadeFooter from '@/components/common/FireBrigadeFooter'
import OurTasksClient from '@/components/home/OurTasksClient'
import TimelineEventCard from '@/components/history/TimelineEventCard'
import type { History, Task } from '@/payload-types'

export const dynamic = 'force-dynamic'

type Locale = 'de' | 'en'

type Props = {
  searchParams: Promise<{ lang?: string }>
}

function parseLocale(lang?: string): Locale {
  return lang === 'en' ? 'en' : 'de'
}

const getPayloadClient = cache(async () => {
  const payloadConfig = await config
  return getPayload({ config: payloadConfig })
})

const getSiteTitle = cache(async (locale: Locale): Promise<string> => {
  try {
    const payload = await getPayloadClient()
    const siteSettings = await payload.findGlobal({ slug: 'site-settings', locale })
    return (siteSettings as any)?.siteName || ''
  } catch {
    return ''
  }
})

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { lang } = await searchParams
  const locale = parseLocale(lang)

  const siteTitle = await getSiteTitle(locale)
  const pageTitle = locale === 'de' ? 'Geschichte' : 'History'

  return {
    title: siteTitle ? `${pageTitle} | ${siteTitle}` : pageTitle,
    alternates: {
      canonical: `/geschichte?lang=${locale}`,
      languages: {
        de: '/geschichte?lang=de',
        en: '/geschichte?lang=en',
      },
    },
  }
}

function getImageUrl(image: unknown): string {
  const fallback =
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80'
  if (!image) return fallback
  if (typeof image === 'number') return fallback
  if (typeof image === 'object' && image !== null) {
    const img = image as Record<string, unknown>
    if ('url' in img && typeof img.url === 'string') return img.url
    if ('filename' in img && typeof img.filename === 'string') return `/media/${img.filename}`
  }
  return fallback
}

type TimelineItem = {
  year: string
  header: string | null
  description: string
  image: unknown | null
  videoUrl: string | null
}

export default async function GeschichtePage({ searchParams }: Props) {
  const { lang } = await searchParams
  const locale = parseLocale(lang)

  const fallbackTranslations = {
    de: {
      title: 'Geschichte der FF-Droß',
      intro:
        'Unsere Geschichte begann schon sehr früh, und wir wollen diese Arbeit noch lange weiterführen. Laufend werden Neuerungen vom NÖ Landesfeuerwehrverband eingeführt, die das Arbeiten in der Feuerwehr erleichtern sollen. Die Ausbildung wird immer umfangreicher, aber auch interessanter. Wir sind stolz, das Feuerwehrwesen in Droß aufrechtzuerhalten.',
      chronikTitle: 'CHRONIK',
      heroTitle: 'Geschichte der FF-Droß',
      heroSubtitle: 'Mehr als 140 Jahre im Dienst unserer Gemeinde',
      heroParagraph1:
        'Bei der Feuerwehr Droß wollen wir das größte Problem lösen: jeder braucht Sicherheit. Unsere Geschichte begann schon sehr früh, und wir wollen diese Arbeit noch lange weiterführen.',
      heroParagraph2:
        'Laufend werden Neuerungen vom NÖ Landesfeuerwehrverband eingeführt, die das Arbeiten in der Feuerwehr erleichtern sollen. Die Ausbildung wird immer umfangreicher, aber auch interessanter. Wir sind stolz, das Feuerwehrwesen in Droß aufrechtzuerhalten.',
      heroParagraph3:
        'Im Feuerwehrwesen brauchen wir Erfahrung und Kameradschaft, um fundierte Entscheidungen zu treffen. Die Feuerwehr Droß bietet die zuverlässigsten Einsätze und den besten Service in der Region. Wir möchten diese Werte so vielen Menschen wie möglich zugänglich machen.',
    },
    en: {
      title: 'History of FF Droß',
      intro:
        'Our history began very early, and we want to continue this work for a long time to come. The Lower Austrian State Fire Brigade Association continuously introduces innovations that are intended to make work in the fire brigade easier. Training is becoming more and more extensive, but also more interesting. We are proud to maintain the fire service in Droß.',
      chronikTitle: 'CHRONICLE',
      heroTitle: 'History of FF Droß',
      heroSubtitle: 'More than 140 years serving our community',
      heroParagraph1:
        'At Fire Brigade Droß, we want to solve the biggest problem: everyone needs safety. Our history began very early, and we want to continue this work for a long time to come.',
      heroParagraph2:
        'The Lower Austrian State Fire Brigade Association continuously introduces innovations that are intended to make work in the fire brigade easier. Training is becoming more and more extensive, but also more interesting. We are proud to maintain the fire service in Droß.',
      heroParagraph3:
        'In the fire service, we need experience and camaraderie to make informed decisions. Fire Brigade Droß provides the most reliable operations and best service in the region. We aim to make these values accessible to as many people as possible.',
    },
  } as const

  let historyData: History | null = null
  let tasks: Task[] = []

  try {
    const payload = await getPayloadClient()

    const [historyResult, tasksResult] = await Promise.all([
      payload.find({
        collection: 'history',
        where: { _status: { equals: 'published' } },
        limit: 1,
        locale,
        depth: 1,
        sort: '-createdAt',
      }),
      payload.find({
        collection: 'tasks',
        sort: 'order',
        locale,
      }),
    ])

    historyData = historyResult.docs?.[0] ?? null
    tasks = tasksResult.docs || []
  } catch (error) {
    console.error('Error fetching Geschichte page data:', error)
  }

  const t = historyData
    ? {
        title: fallbackTranslations[locale].title,
        intro: fallbackTranslations[locale].intro,
        chronikTitle: fallbackTranslations[locale].chronikTitle,
        heroTitle: historyData.heroTitle || fallbackTranslations[locale].heroTitle,
        heroSubtitle: historyData.heroSubtitle || fallbackTranslations[locale].heroSubtitle,
        heroParagraph1: historyData.heroParagraph1 || fallbackTranslations[locale].heroParagraph1,
        heroParagraph2: historyData.heroParagraph2 || fallbackTranslations[locale].heroParagraph2,
        heroParagraph3: historyData.heroParagraph3 || fallbackTranslations[locale].heroParagraph3,
      }
    : fallbackTranslations[locale]

  const fallbackTimeline: TimelineItem[] = [
    {
      year: '1883',
      header: null,
      description:
        locale === 'de'
          ? 'Zur Gründung der Feuerwehr kam es am 14. November 1883 unter Bürgermeister Josef Mößlinger durch die Herren Florian Türk, Johann Steiner und Franz Heuritsch.'
          : 'The fire brigade was founded on November 14, 1883 by Mayor Josef Mößlinger through Florian Türk, Johann Steiner and Franz Heuritsch.',
      image: null,
      videoUrl: null,
    },
  ]

  const timelineEvents: TimelineItem[] =
    historyData?.timelineEvents &&
    Array.isArray(historyData.timelineEvents) &&
    historyData.timelineEvents.length > 0
      ? historyData.timelineEvents.map((event) => {
          const description =
            typeof event.description === 'object' && event.description !== null
              ? (event.description as Record<string, string>)[locale] ||
                (event.description as Record<string, string>).en ||
                (event.description as Record<string, string>).de ||
                ''
              : typeof event.description === 'string'
                ? event.description
                : ''

          const header =
            typeof event.header === 'object' && event.header !== null
              ? (event.header as Record<string, string>)[locale] ||
                (event.header as Record<string, string>).en ||
                (event.header as Record<string, string>).de ||
                null
              : typeof event.header === 'string'
                ? event.header
                : null

          return {
            year: String(event.year ?? ''),
            header,
            description,
            image: event.image || null,
            videoUrl: event.videoUrl || null,
          }
        })
      : fallbackTimeline

  return (
    <>
      <Suspense fallback={<div className="h-16 bg-fire" />}>
        <Navigation initialLocale={locale} />
      </Suspense>

      <div className="relative bg-gradient-to-b from-gray-50 via-white to-gray-50 pb-16">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
            <div className="h-40 md:h-52 bg-[url('/images/banner.png')] bg-cover bg-center opacity-20 rounded-b-3xl" />
          </div>
        </div>

        <section className="relative min-h-[500px] md:min-h-[600px] lg:min-h-[700px] bg-gradient-to-br from-gray-900 via-red-600 to-red-500 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'linear-gradient(30deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%), linear-gradient(60deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)',
                backgroundSize: '60px 60px',
              }}
            />
          </div>

          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-400/40 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-500/40 rounded-full blur-3xl"></div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
            <svg
              className="w-full h-24 md:h-32"
              viewBox="0 0 1440 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
            >
              <path d="M0 0L1440 0L1440 120L0 120Z" fill="white" />
            </svg>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 lg:px-12 flex items-center pb-24 md:pb-32">
            <div className="grid lg:grid-cols-2 gap-12 items-center w-full py-12 md:py-16">
              <div className="relative">
                <div className="relative w-full h-[400px] md:h-[500px] flex items-center justify-center">
                  {historyData?.heroImage &&
                  typeof historyData.heroImage === 'object' &&
                  'url' in historyData.heroImage ? (
                    <div className="relative w-full h-full rounded-lg overflow-hidden shadow-2xl">
                      <Image
                        src={
                          typeof historyData.heroImage.url === 'string'
                            ? historyData.heroImage.url
                            : getImageUrl(historyData.heroImage)
                        }
                        alt={t.heroTitle || t.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 50vw"
                        quality={90}
                        priority
                      />
                    </div>
                  ) : (
                    <div className="relative w-full h-full flex items-end justify-center">
                      <div className="relative w-full h-full flex items-end justify-center">
                        <div className="absolute left-1/4 bottom-0 w-32 h-48 bg-gradient-to-t from-fire to-fire-light rounded-t-lg transform -skew-x-12 opacity-80" />
                        <div className="relative z-10">
                          <div className="w-40 h-64 bg-gradient-to-t from-fire to-fire-light rounded-t-xl transform -skew-x-6 shadow-2xl">
                            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-br from-white to-gray-100 rounded-t-xl" />
                            <div className="absolute top-8 right-0 transform translate-x-8">
                              <div className="absolute left-0 top-0 w-1 h-20 bg-gray-800" />
                              <div className="absolute left-1 top-0 w-16 h-12 bg-orange-500 transform -skew-y-12 shadow-lg">
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="grid grid-cols-2 gap-1 p-1">
                                    <div className="w-2 h-2 bg-white rounded-sm" />
                                    <div className="w-2 h-2 bg-white rounded-sm" />
                                    <div className="w-2 h-2 bg-white rounded-sm" />
                                    <div className="w-2 h-2 bg-white rounded-sm" />
                                  </div>
                                </div>
                                <div className="absolute -bottom-1 right-0 w-0 h-0 border-l-[8px] border-l-orange-500 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent" />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="absolute right-1/4 bottom-0 w-28 h-40 bg-gradient-to-t from-red-600 to-red-500 rounded-t-lg transform skew-x-12 opacity-90">
                          <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-br from-white to-gray-100 rounded-t-lg" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-white overflow-hidden">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-center lg:text-left break-words">
                  {t.heroTitle || t.title}
                </h1>
                <p className="text-lg md:text-xl text-white/90 mb-8 text-center lg:text-left max-w-xl mx-auto lg:mx-0 break-words">
                  {t.heroSubtitle}
                </p>
                <div className="space-y-4 text-base md:text-lg leading-relaxed text-white/90 max-w-2xl mx-auto lg:mx-0 break-words overflow-hidden">
                  {t.heroParagraph1 && (
                    <p>
                      {t.heroParagraph1.split(/(\*\*.*?\*\*)/).map((part: string, i: number) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                          return <strong key={i}>{part.slice(2, -2)}</strong>
                        }
                        return <span key={i}>{part}</span>
                      })}
                    </p>
                  )}
                  {t.heroParagraph2 && <p>{t.heroParagraph2}</p>}
                  {t.heroParagraph3 && (
                    <p>
                      {t.heroParagraph3.split(/(\*\*.*?\*\*)/).map((part: string, i: number) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                          return <strong key={i}>{part.slice(2, -2)}</strong>
                        }
                        return <span key={i}>{part}</span>
                      })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16">
          <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-fire mb-12 text-center">
              {t.chronikTitle}
            </h2>
            <div className="relative">
              <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-fire via-red-400 to-fire transform md:-translate-x-1/2" />

              <div className="space-y-12">
                {timelineEvents.map((event, index: number) => (
                  <div
                    key={index}
                    className="relative flex items-start md:items-center gap-6 md:gap-8"
                  >
                    <div className="relative z-10 flex-shrink-0">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-fire border-4 border-white shadow-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm md:text-base">
                          {event.year}
                        </span>
                      </div>
                    </div>

                    <TimelineEventCard
                      image={event.image}
                      videoUrl={event.videoUrl}
                      header={event.header}
                      description={event.description}
                      alignment={index % 2 === 0 ? 'right' : 'left'}
                      year={event.year}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="mt-24">
          <OurTasksClient tasks={tasks} locale={locale} />
        </div>
      </div>

      <FireBrigadeFooter initialLocale={locale} />
    </>
  )
}
