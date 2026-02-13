import { Suspense } from 'react'
import { getPayload } from 'payload'
import config from '@/payload.config'
import Navigation from '@/components/common/Navigation'
import Breadcrumb from '@/components/common/Breadcrumb'
import FireBrigadeFooter from '@/components/common/FireBrigadeFooter'
import ContactInfoSection from '@/components/contact/ContactInfoSection'
import ContactForm from '@/components/contact/ContactForm'
import MapSection from '@/components/contact/MapSection'

type Props = {
  searchParams: Promise<{ lang?: string }>
}

export default async function ContactPage({ searchParams }: Props) {
  const params = await searchParams
  const locale = (params.lang === 'en' || params.lang === 'de' ? params.lang : 'de') as 'en' | 'de'

  // Fetch contact info and map settings from CMS
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  let contactInfo = null
  let mapSettings = null
  try {
    contactInfo = await payload.findGlobal({
      slug: 'contact-info',
      locale: locale,
    })
    console.log('Contact info fetched:', JSON.stringify(contactInfo, null, 2))
  } catch (error) {
    console.error('Error fetching contact info:', error)
  }

  try {
    mapSettings = await payload.findGlobal({
      slug: 'map-settings',
      locale: locale,
    })
  } catch (error) {
    console.error('Error fetching map settings:', error)
  }

  const translations = {
    de: {
      title: 'Kontakt',
      subtitle: 'Wir freuen uns auf Ihre Nachricht',
    },
    en: {
      title: 'Contact Us',
      subtitle: 'We look forward to hearing from you',
    },
  }

  const t = translations[locale]

  return (
    <>
      <Suspense fallback={<div className="h-16 bg-fire" />}>
        <Navigation initialLocale={locale} />
      </Suspense>
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 -mt-2 md:-mt-3 relative z-10">
        <Breadcrumb
          items={[
            {
              label: locale === 'de' ? 'Startseite' : 'Home',
              href: `/?lang=${locale}`,
            },
            {
              label: t.title,
            },
          ]}
          locale={locale}
        />
      </div>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-16 px-4 pt-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-extrabold text-fire mb-4 tracking-tight">
              {t.title}
            </h1>
            <div className="w-20 h-1 bg-fire mx-auto rounded-full mb-4"></div>
            <p className="text-xl md:text-2xl text-gray-600 font-medium max-w-2xl mx-auto">
              {t.subtitle}
            </p>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12">
            {/* Left Column: Address */}
            <div className="order-2 lg:order-1">
              <ContactInfoSection
                address={contactInfo?.address}
                locale={locale}
              />
            </div>

            {/* Right Column: Contact Form */}
            <div className="order-1 lg:order-2">
              <ContactForm locale={locale} />
            </div>
          </div>

          {/* Map Section */}
          <MapSection mapConfig={mapSettings} locale={locale} />
        </div>
      </div>
      <FireBrigadeFooter initialLocale={locale} />
    </>
  )
}
