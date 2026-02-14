import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import Navigation from '@/components/common/Navigation'
import Breadcrumb from '@/components/common/Breadcrumb'
import FireBrigadeFooter from '@/components/common/FireBrigadeFooter'

type Props = {
  searchParams: Promise<{ lang?: string }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams
  const locale = (params.lang === 'en' || params.lang === 'de' ? params.lang : 'de') as 'en' | 'de'

  return {
    title: locale === 'de' ? 'Über uns' : 'About us',
  }
}

export default async function AboutPage({ searchParams }: Props) {
  const params = await searchParams
  const locale = (params.lang === 'en' || params.lang === 'de' ? params.lang : 'de') as 'en' | 'de'

  const translations = {
    de: {
      title: 'Wer wir sind',
      breadcrumb: 'Über uns',
      heroSubtitle: 'Gemeinsam für die Sicherheit in Droß – Tag und Nacht im Einsatz.',
      introTitle: 'Feuerwehr Droß – mehr als nur Einsätze',
      introText1:
        'Wir sind eine freiwillige Feuerwehr, die tief in der Gemeinde verwurzelt ist. Unsere Mitglieder sind Nachbarn, Freunde und Kolleginnen und Kollegen aus allen Lebensbereichen – vereint durch das Ziel, Menschen zu helfen.',
      introText2:
        'Ob Brandbekämpfung, technische Hilfeleistung oder Präventionsarbeit: Wir stehen bereit, wenn wir gebraucht werden. Ausbildung, Kameradschaft und Professionalität bilden das Fundament unserer Arbeit.',
      missionTitle: 'Unser Auftrag',
      missionPoints: [
        'Schutz von Leben, Gesundheit und Eigentum der Bevölkerung',
        'Schnelle und professionelle Hilfe in Not- und Gefahrensituationen',
        'Laufende Aus- und Weiterbildung unserer Kameradinnen und Kameraden',
        'Stärkung des Sicherheitsbewusstseins in der Gemeinde',
      ],
      valuesTitle: 'Werte, die uns leiten',
      values: [
        {
          title: 'Kameradschaft',
          text: 'Wir vertrauen einander – im Einsatz und darüber hinaus. Zusammenhalt ist unsere größte Stärke.',
        },
        {
          title: 'Professionalität',
          text: 'Regelmäßige Übungen, moderne Ausrüstung und klare Abläufe sorgen dafür, dass jeder Handgriff sitzt.',
        },
        {
          title: 'Ehrenamt',
          text: 'Unser Einsatz ist freiwillig, unsere Verantwortung groß. Wir engagieren uns aus Überzeugung für unsere Gemeinde.',
        },
      ],
      peopleTitle: 'Die Menschen hinter der Uniform',
      peopleText:
        'Hinter jeder Uniform steckt eine Persönlichkeit: vom Jugendlichen in der Feuerwehrjugend bis zur erfahrenen Führungskraft. Was uns verbindet, ist die Bereitschaft, im Ernstfall füreinander und für andere da zu sein.',
      statsService: 'Jahre im Dienst der Bevölkerung',
      statsMembers: 'aktive Mitglieder',
      statsYouth: 'Jugendmitglieder',
    },
    en: {
      title: 'Who we are',
      breadcrumb: 'About us',
      heroSubtitle: 'Together for the safety of Droß – on duty day and night.',
      introTitle: 'Fire Brigade Droß – more than just operations',
      introText1:
        'We are a volunteer fire brigade deeply rooted in our community. Our members are neighbours, friends and colleagues from all walks of life – united by the goal of helping people.',
      introText2:
        'Whether firefighting, technical assistance or prevention work: we are ready whenever we are needed. Training, camaraderie and professionalism are the foundation of our work.',
      missionTitle: 'Our mission',
      missionPoints: [
        'Protecting lives, health and property in our community',
        'Providing fast and professional help in emergencies',
        'Ongoing training and development for all members',
        'Strengthening safety awareness among citizens',
      ],
      valuesTitle: 'Values that guide us',
      values: [
        {
          title: 'Camaraderie',
          text: 'We rely on each other – during operations and beyond. Our strongest asset is our team spirit.',
        },
        {
          title: 'Professionalism',
          text: 'Regular training, modern equipment and clear procedures ensure that every move counts.',
        },
        {
          title: 'Volunteer service',
          text: 'Our work is voluntary, our responsibility is great. We serve our community out of conviction.',
        },
      ],
      peopleTitle: 'The people behind the uniform',
      peopleText:
        'Behind every uniform is a person: from youth members to experienced officers. What unites us is the willingness to be there for others when it matters most.',
      statsService: 'years serving the community',
      statsMembers: 'active members',
      statsYouth: 'youth members',
    },
  }

  const t = translations[locale]

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

        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 -mt-2 md:-mt-3 relative z-10">
          <Breadcrumb
            items={[
              {
                label: locale === 'de' ? 'Startseite' : 'Home',
                href: `/?lang=${locale}`,
              },
              {
                label: t.breadcrumb,
              },
            ]}
            locale={locale}
          />
        </div>

        <section className="pt-8 md:pt-10">
          <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
            <div className="grid gap-10 lg:grid-cols-[3fr,2fr] items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-fire mb-4 shadow-sm">
                  <span className="inline-block h-2 w-2 rounded-full bg-fire" />
                  {locale === 'de' ? 'Unsere Feuerwehr' : 'Our fire brigade'}
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-fire tracking-tight mb-4">
                  {t.title}
                </h1>
                <p className="text-lg md:text-xl text-gray-700 max-w-2xl mb-6">{t.heroSubtitle}</p>
                <div className="flex flex-wrap gap-4">
                  <div className="rounded-2xl bg-white/80 backdrop-blur shadow-md px-5 py-4 border border-red-100">
                    <p className="text-3xl font-extrabold text-fire">24/7</p>
                    <p className="text-sm font-medium text-gray-600">
                      {locale === 'de' ? 'Bereit für den Einsatz' : 'Ready to respond'}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/80 backdrop-blur shadow-md px-5 py-4 border border-red-100">
                    <p className="text-3xl font-extrabold text-fire">100%</p>
                    <p className="text-sm font-medium text-gray-600">
                      {locale === 'de' ? 'Ehrenamtliches Engagement' : 'Voluntary commitment'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-red-100 bg-[url('/images/image-1.jpg')] bg-cover bg-center" />
                <div className="absolute -bottom-6 -left-4 md:-left-8 rounded-2xl bg-white/90 shadow-xl px-4 py-3 border border-gray-100 flex items-center gap-3">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-fire text-white text-sm font-semibold">
                    FF
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-gray-700">
                      {locale === 'de' ? 'Gemeinsam stark' : 'Stronger together'}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      {locale === 'de'
                        ? 'Einsatz, Übung & Gemeinschaft'
                        : 'Operations, drills & community'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16">
          <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
            <div className="grid gap-10 lg:grid-cols-[3fr,2fr] items-start">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4">
                  {t.introTitle}
                </h2>
                <p className="text-gray-700 text-base md:text-lg mb-4 leading-relaxed">
                  {t.introText1}
                </p>
                <p className="text-gray-700 text-base md:text-lg leading-relaxed">{t.introText2}</p>
              </div>
              <div className="rounded-3xl bg-white/90 shadow-lg border border-red-100 p-6 md:p-7">
                <h3 className="text-lg md:text-xl font-bold text-fire mb-4">{t.missionTitle}</h3>
                <ul className="space-y-3">
                  {t.missionPoints.map((point) => (
                    <li key={point} className="flex gap-3">
                      <span className="mt-1 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-50 text-fire">
                        <svg
                          className="h-3 w-3"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0l-3.25-3.25a1 1 0 111.414-1.414L8.5 11.586l6.543-6.543a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                      <p className="text-sm md:text-base text-gray-700">{point}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16">
          <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
            <div className="flex items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                  {t.valuesTitle}
                </h2>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {t.values.map((value) => (
                <div
                  key={value.title}
                  className="relative overflow-hidden rounded-3xl bg-white shadow-md border border-gray-100 p-6 flex flex-col gap-2"
                >
                  <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-red-50" />
                  <h3 className="relative text-lg font-bold text-fire">{value.title}</h3>
                  <p className="relative text-sm md:text-base text-gray-700 leading-relaxed">
                    {value.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-16">
          <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
            <div className="grid gap-10 lg:grid-cols-[3fr,2fr] items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4">
                  {t.peopleTitle}
                </h2>
                <p className="text-gray-700 text-base md:text-lg leading-relaxed">{t.peopleText}</p>
              </div>
              <div className="grid grid-cols-3 gap-3 md:gap-4">
                <div className="rounded-2xl bg-white/90 backdrop-blur shadow-md px-4 py-3 border border-red-100 text-center">
                  <p className="text-2xl md:text-3xl font-extrabold text-fire">+50</p>
                  <p className="text-[11px] md:text-xs text-gray-600 font-medium">
                    {t.statsService}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/90 backdrop-blur shadow-md px-4 py-3 border border-red-100 text-center">
                  <p className="text-2xl md:text-3xl font-extrabold text-fire">30+</p>
                  <p className="text-[11px] md:text-xs text-gray-600 font-medium">
                    {t.statsMembers}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/90 backdrop-blur shadow-md px-4 py-3 border border-red-100 text-center">
                  <p className="text-2xl md:text-3xl font-extrabold text-fire">10+</p>
                  <p className="text-[11px] md:text-xs text-gray-600 font-medium">{t.statsYouth}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16">
          <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
            <div className="bg-gradient-to-r from-fire to-red-500 rounded-3xl shadow-xl p-8 md:p-12 text-white text-center">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                {locale === 'de'
                  ? 'Erfahren Sie mehr über unsere Geschichte'
                  : 'Learn more about our history'}
              </h3>
              <p className="text-lg mb-6 opacity-95 max-w-2xl mx-auto">
                {locale === 'de'
                  ? 'Entdecken Sie die reiche Geschichte der Freiwilligen Feuerwehr Droß von 1883 bis heute.'
                  : 'Discover the rich history of the Droß Volunteer Fire Department from 1883 to today.'}
              </p>
              <Link
                href={`/geschichte?lang=${locale}`}
                className="inline-flex items-center gap-2 bg-white text-fire font-bold px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl"
              >
                <span>{locale === 'de' ? 'Zur Geschichte' : 'View History'}</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      </div>

      <FireBrigadeFooter initialLocale={locale} />
    </>
  )
}
