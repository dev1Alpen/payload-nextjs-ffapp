'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'

const COOKIE_CONSENT_KEY = 'cookieConsent'
const DEFAULT_CONSENT_VERSION = 1

type Locale = 'en' | 'de'

type CookieConsent = {
  version: number
  necessary: boolean
  analytics: boolean
  marketing: boolean
  timestamp: string
}

type CookieBannerData = {
  enabled?: boolean
  version?: number
  title?: string
  description?: string
  buttonText?: string
  rejectButtonText?: string
  saveButtonText?: string
  essentialLabel?: string
  essentialDescription?: string
  showAnalytics?: boolean
  analyticsLabel?: string
  analyticsDescription?: string
  showMarketing?: boolean
  marketingLabel?: string
  marketingDescription?: string
}

const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [bannerData, setBannerData] = useState<CookieBannerData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [locale, setLocale] = useState<Locale>('de')
  const [analyticsOn, setAnalyticsOn] = useState(false)
  const [marketingOn, setMarketingOn] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [forceOpen, setForceOpen] = useState(false)

  const searchParams = useSearchParams()
  const firstButtonRef = useRef<HTMLButtonElement | null>(null)

  // Derive locale from URL params (en/de)
  useEffect(() => {
    const requested = (searchParams?.get('lang') === 'en' ? 'en' : 'de') as Locale
    setLocale(requested)
  }, [searchParams])

  // Allow other components (e.g. footer) to trigger reopening the banner
  useEffect(() => {
    const handler = () => {
      const stored = readStoredConsent()
      if (stored) {
        setAnalyticsOn(stored.analytics)
        setMarketingOn(stored.marketing)
      }
      setForceOpen(true)
      setIsVisible(true)
    }

    window.addEventListener('open-cookie-settings', handler)
    return () => window.removeEventListener('open-cookie-settings', handler)
  }, [])

  // Fetch cookie banner configuration from backend
  useEffect(() => {
    const fetchBannerData = async () => {
      try {
        const response = await fetch(`/api/cookie-banner?locale=${locale}`)
        if (!response.ok) {
          throw new Error('Failed to fetch cookie banner data')
        }

        const data: CookieBannerData = await response.json()
        setBannerData(data)
      } catch (error) {
        console.error('Error fetching cookie banner:', error)
        // Fallback static configuration to remain compliant if the CMS is unavailable
        setBannerData({
          enabled: true,
          version: DEFAULT_CONSENT_VERSION,
          title: locale === 'en' ? 'Cookies & Privacy' : 'Cookies & Datenschutz',
          description:
            locale === 'en'
              ? 'We use cookies to operate this site securely and, with your consent, to measure usage and show relevant content. You can accept all, reject non-essential cookies or choose individual categories.'
              : 'Wir verwenden Cookies, um diese Website sicher zu betreiben und – mit Ihrer Zustimmung – die Nutzung zu messen und relevante Inhalte anzuzeigen. Sie können alle akzeptieren, nur notwendige Cookies zulassen oder einzelne Kategorien auswählen.',
          buttonText: locale === 'en' ? 'Accept all' : 'Alle akzeptieren',
        })
      } finally {
        setIsLoading(false)
      }
    }

    void fetchBannerData()
  }, [locale])

  // Initialise visibility + toggle state based on stored consent and current version
  useEffect(() => {
    if (isLoading || !bannerData) return
    if (bannerData.enabled === false) {
      setIsVisible(false)
      return
    }

    // If the user explicitly opened the dialog from "Cookie settings",
    // always show it regardless of existing consent.
    if (forceOpen) {
      setIsVisible(true)
      return
    }

    const currentVersion = bannerData.version ?? DEFAULT_CONSENT_VERSION
    const stored = readStoredConsent()

    if (!stored || stored.version !== currentVersion) {
      // No consent yet or outdated consent – show banner with safe defaults
      setAnalyticsOn(false)
      setMarketingOn(false)
      setIsVisible(true)
      return
    }

    setAnalyticsOn(stored.analytics)
    setMarketingOn(stored.marketing)
    setIsVisible(false)
  }, [bannerData, isLoading, forceOpen])

  // Focus first action button when banner becomes visible (accessibility)
  useEffect(() => {
    if (!isVisible) return

    const timer = window.setTimeout(() => {
      firstButtonRef.current?.focus()
    }, 50)

    return () => {
      window.clearTimeout(timer)
    }
  }, [isVisible])

  const saveConsent = (consent: Omit<CookieConsent, 'version' | 'timestamp'>) => {
    const version = bannerData?.version ?? DEFAULT_CONSENT_VERSION
    const payload: CookieConsent = {
      version,
      timestamp: new Date().toISOString(),
      necessary: true,
      analytics: consent.analytics,
      marketing: consent.marketing,
    }

    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(payload))
        // Also persist as a cookie so server-side logic can read the decision if needed
        document.cookie = `${COOKIE_CONSENT_KEY}=${encodeURIComponent(
          JSON.stringify(payload),
        )}; path=/; max-age=31536000; samesite=lax`
      }
    } catch (error) {
      console.error('Failed to persist cookie consent', error)
    }
  }

  const announceStatus = (message: string) => {
    setStatusMessage(message)
    // Clear after a short delay so screen readers do not repeat old messages
    window.setTimeout(() => setStatusMessage(null), 4000)
  }

  const handleAcceptAll = () => {
    saveConsent({ necessary: true, analytics: true, marketing: true })
    setAnalyticsOn(true)
    setMarketingOn(true)
    setIsVisible(false)
    announceStatus(
      locale === 'en'
        ? 'All cookies have been accepted.'
        : 'Alle Cookies wurden akzeptiert.',
    )
  }

  const handleRejectAll = () => {
    // Necessary cookies remain allowed for basic operation, analytics/marketing are disabled
    saveConsent({ necessary: true, analytics: false, marketing: false })
    setAnalyticsOn(false)
    setMarketingOn(false)
    setIsVisible(false)
    announceStatus(
      locale === 'en'
        ? 'Only essential cookies are being used.'
        : 'Es werden nur unbedingt erforderliche Cookies verwendet.',
    )
  }

  const handleSaveSelection = () => {
    saveConsent({ necessary: true, analytics: analyticsOn, marketing: marketingOn })
    // Sync local state with what we actually stored
    const stored = readStoredConsent()
    if (stored) {
      setAnalyticsOn(stored.analytics)
      setMarketingOn(stored.marketing)
    }
    setIsVisible(false)
    announceStatus(
      locale === 'en'
        ? 'Your cookie preferences have been saved.'
        : 'Ihre Cookie-Einstellungen wurden gespeichert.',
    )
  }

  if (isLoading || !bannerData || !isVisible) return null

  const titleText =
    bannerData.title ||
    (locale === 'en' ? 'Cookies & Privacy settings' : 'Cookies & Datenschutzeinstellungen')

  const descriptionText =
    bannerData.description ||
    (locale === 'en'
      ? 'We use necessary cookies to run the site and, with your consent, additional cookies for statistics and marketing. You can accept all, reject non-essential cookies or choose individual categories.'
      : 'Wir verwenden notwendige Cookies für den Betrieb der Website und – mit Ihrer Zustimmung – zusätzliche Cookies für Statistik und Marketing. Sie können alle akzeptieren, nur notwendige Cookies zulassen oder einzelne Kategorien auswählen.')

  const acceptAllLabel =
    bannerData.buttonText || (locale === 'en' ? 'Accept all' : 'Alle akzeptieren')
  const rejectAllLabel =
    bannerData.rejectButtonText ||
    (locale === 'en' ? 'Reject non-essential' : 'Nur notwendige')
  const saveSelectionLabel =
    bannerData.saveButtonText ||
    (locale === 'en' ? 'Save selection' : 'Auswahl speichern')

  // Determine how many categories we are showing to adjust layout responsively
  const showAnalyticsCategory = bannerData.showAnalytics ?? true
  const showMarketingCategory = bannerData.showMarketing ?? true
  const totalCategories =
    1 + (showAnalyticsCategory ? 1 : 0) + (showMarketingCategory ? 1 : 0)

  let categoryGridClass = 'grid-cols-1'
  if (totalCategories === 2) {
    categoryGridClass = 'grid-cols-1 sm:grid-cols-2'
  } else if (totalCategories >= 3) {
    categoryGridClass = 'grid-cols-1 sm:grid-cols-3'
  }

  return (
    <>
      {/* Live region for status updates (screen readers). No sound is played automatically. */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {statusMessage}
      </div>

      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/60" aria-hidden="true" />

      {/* Cookie banner dialog */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-6 sm:pb-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-banner-title"
        aria-describedby="cookie-banner-description"
      >
        <div className="w-full max-w-4xl">
          <div className="rounded-3xl bg-gradient-to-br from-white to-gray-50 p-4 sm:p-6 shadow-2xl ring-1 ring-gray-200/70 backdrop-blur-sm">
            <div className="flex flex-col gap-4">
              {/* Text content */}
              <div className="space-y-2 sm:space-y-3">
                <h3
                  id="cookie-banner-title"
                  className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight"
                >
                  {titleText}
                </h3>
                <p
                  id="cookie-banner-description"
                  className="text-sm sm:text-base text-gray-700 leading-relaxed"
                >
                  {descriptionText}
                </p>
              </div>

              {/* Categories */}
              <div className={`grid gap-3 ${categoryGridClass}`} aria-label="Cookie categories">
                <CategoryCard
                  title={
                    bannerData.essentialLabel ||
                    (locale === 'en' ? 'Essential' : 'Unbedingt erforderlich')
                  }
                  description={
                    bannerData.essentialDescription ||
                    (locale === 'en'
                      ? 'Required for security, load balancing and language preferences. Cannot be disabled.'
                      : 'Erforderlich für Sicherheit, Lastverteilung und Spracheinstellungen. Nicht deaktivierbar.')
                  }
                  checked
                  disabled
                />

                {showAnalyticsCategory && (
                  <CategoryCard
                    title={
                      bannerData.analyticsLabel ||
                      (locale === 'en' ? 'Analytics' : 'Statistik')
                    }
                    description={
                      bannerData.analyticsDescription ||
                      (locale === 'en'
                        ? 'Helps us understand how our website is used so we can improve it.'
                        : 'Hilft uns zu verstehen, wie unsere Website genutzt wird, um sie zu verbessern.')
                    }
                    checked={analyticsOn}
                    onToggle={() => setAnalyticsOn((prev) => !prev)}
                  />
                )}

                {showMarketingCategory && (
                  <CategoryCard
                    title={
                      bannerData.marketingLabel ||
                      (locale === 'en' ? 'Marketing' : 'Marketing')
                    }
                    description={
                      bannerData.marketingDescription ||
                      (locale === 'en'
                        ? 'Used to display relevant information and offers based on your interests.'
                        : 'Wird verwendet, um relevante Informationen und Angebote auf Basis Ihrer Interessen anzuzeigen.')
                    }
                    checked={marketingOn}
                    onToggle={() => setMarketingOn((prev) => !prev)}
                  />
                )}
              </div>

              {/* Actions */}
              <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:gap-3">
                  <button
                    ref={firstButtonRef}
                    type="button"
                    onClick={handleRejectAll}
                    className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
                  >
                    {rejectAllLabel}
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveSelection}
                    className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
                  >
                    {saveSelectionLabel}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="inline-flex items-center justify-center rounded-full bg-red-600 px-6 py-2.5 text-sm sm:text-base font-semibold text-white shadow-md hover:bg-red-500 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
                >
                  {acceptAllLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

type CategoryCardProps = {
  title: string
  description: string
  checked: boolean
  disabled?: boolean
  onToggle?: () => void
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  title,
  description,
  checked,
  disabled,
  onToggle,
}) => {
  const id = `cookie-toggle-${title.replace(/\s+/g, '-').toLowerCase()}`

  return (
    <div className="rounded-2xl border border-gray-200 bg-white/80 p-3 text-left shadow-sm">
      <div className="flex items-start gap-3">
        <div className="mt-1">
          <button
            type="button"
            id={id}
            role="switch"
            aria-checked={checked}
            aria-disabled={disabled}
            disabled={disabled}
            onClick={disabled ? undefined : onToggle}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 ${
              checked ? 'bg-red-600' : 'bg-gray-300'
            } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                checked ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          <p className="mt-1 text-xs text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  )
}

function readStoredConsent(): CookieConsent | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(COOKIE_CONSENT_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as CookieConsent
    if (!parsed || typeof parsed.version !== 'number') return null
    return parsed
  } catch {
    return null
  }
}

export default CookieBanner



