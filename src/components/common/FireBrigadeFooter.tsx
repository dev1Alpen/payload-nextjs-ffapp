'use client'

import React, { useEffect, useRef, useState, startTransition } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'
import ArrowIcon from './ArrowIcon'
import { useSharedData } from '@/contexts/SharedDataContext'
import { getCategoryLabel, getCategoryPath } from '@/lib/categories'

type Locale = 'en' | 'de'

interface FireBrigadeFooterProps {
  initialLocale?: Locale
}

export default function FireBrigadeFooter({ initialLocale = 'de' }: FireBrigadeFooterProps) {
  const year = new Date().getFullYear()
  // Get data from shared context
  const { categories, categoriesLoading, contactInfo, contactInfoLoading } = useSharedData()
  const [locale, setLocale] = useState<Locale>(initialLocale)
  const [langDropdownOpen, setLangDropdownOpen] = useState(false)
  const langDropdownRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Fetch sidebar widgets for social media links
  const [sidebarWidgets, setSidebarWidgets] = useState<{
    facebook?: { enabled?: boolean; pageUrl?: string | null }
    instagram?: { enabled?: boolean; username?: string | null }
  } | null>(null)

  useEffect(() => {
    const fetchSidebarWidgets = async () => {
      try {
        const response = await fetch(`/api/sidebar-widgets?lang=${locale}`)
        if (response.ok) {
          const data = await response.json()
          setSidebarWidgets(data.sidebarWidgets || null)
        }
      } catch (error) {
        console.error('Error fetching sidebar widgets:', error)
      }
    }
    fetchSidebarWidgets()
  }, [locale])

  // Get locale from URL params, cookie, or initial locale
  useEffect(() => {
    const getCookieValue = (name: string): string | null => {
      if (typeof document === 'undefined') return null
      const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`))
      return match ? decodeURIComponent(match[2]) : null
    }

    // Priority 1: URL parameter (highest priority) - always respect URL
    const paramLocale = searchParams?.get('lang')
    if (paramLocale === 'en' || paramLocale === 'de') {
      setLocale(paramLocale)
      return
    }

    // Priority 2: If no URL param, use initialLocale from server
    if (initialLocale) {
      setLocale(initialLocale)
      return
    }

    // Priority 3: Cookie (only if no initialLocale was provided)
    const cookieLocale = getCookieValue('locale')
    if (cookieLocale === 'en' || cookieLocale === 'de') {
      setLocale(cookieLocale)
      return
    }

    // Priority 4: Default to German
    setLocale('de')
  }, [searchParams, initialLocale])

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale)
    setLangDropdownOpen(false)

    if (typeof document !== 'undefined') {
      document.cookie = `locale=${newLocale}; path=/; max-age=31536000; samesite=lax`
    }

    const params = new URLSearchParams(searchParams?.toString() || '')
    params.set('lang', newLocale)
    const query = params.toString()

    // Use startTransition for smoother updates
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname)
      router.refresh()
    })
  }

  const localeOptions = [
    { code: 'en' as Locale, label: 'English', flag: '🇬🇧' },
    { code: 'at' as Locale, label: 'Österreich', flag: '🇦🇹' },
  ]

  const currentLocale = localeOptions.find((opt) => opt.code === locale) || localeOptions[1] // Default to German (index 1)

  // Categories and contact info are now provided by SharedDataContext, no need to fetch here

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false)
      }
    }

    if (langDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [langDropdownOpen])

  return (
    <footer className="w-full text-white" style={{ backgroundColor: '#1B1714' }}>
      {/* Dark red strip at top */}
      <div className="w-full h-1 bg-fire"></div>

      {/* Main footer content */}
      <div className="w-full max-w-[1170px] mx-auto px-4 md:px-8 lg:px-12 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {/* Column 1: NEWS */}
          <div>
            <h3 className="text-white text-base font-bold uppercase tracking-wide mb-6">
              {locale === 'de' ? 'NEWS' : 'NEWS'}
            </h3>
            {categoriesLoading ? (
              <div className="text-white/70 text-sm">
                {locale === 'de' ? 'Lädt...' : 'Loading...'}
              </div>
            ) : categories.length > 0 ? (
              <div
                className="max-h-64 overflow-y-auto pr-2 custom-scrollbar"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(220, 38, 38, 0.5) rgba(255, 255, 255, 0.1)',
                }}
              >
                <ul className="space-y-3">
                  {categories.map((category) => {
                    const categoryLabel = getCategoryLabel(category, locale)
                    const categoryPath = getCategoryPath(category, locale)

                    return (
                      <li key={category.id}>
                        <Link
                          href={`/${categoryPath}${locale ? `?lang=${locale}` : ''}`}
                          className="text-white hover:text-fire transition-colors duration-200 text-sm capitalize"
                        >
                          {categoryLabel}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ) : (
              <ul className="space-y-3">
                <li>
                  <Link
                    href={`/all_posts${locale ? `?lang=${locale}` : ''}`}
                    className="text-white hover:text-fire transition-colors duration-200 text-sm"
                  >
                    {locale === 'de' ? 'Alle Beiträge' : 'All Posts'}
                  </Link>
                </li>
              </ul>
            )}
          </div>

          {/* Column 2: ABOUT US */}
          <div>
            <h3 className="text-white text-base font-bold uppercase tracking-wide mb-6">
              {locale === 'de' ? 'ÜBER UNS' : 'ABOUT US'}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href={`/geschichte${locale ? `?lang=${locale}` : ''}`}
                  className="text-white hover:text-fire transition-colors duration-200 text-sm"
                >
                  {locale === 'de' ? 'Geschichte' : 'History'}
                </Link>
              </li>
              <li>
                <Link
                  href={`/kommando${locale ? `?lang=${locale}` : ''}`}
                  className="text-white hover:text-fire transition-colors duration-200 text-sm"
                >
                  {locale === 'de' ? 'Kommando' : 'Command'}
                </Link>
              </li>
              <li>
                <Link
                  href={`/clerk${locale ? `?lang=${locale}` : ''}`}
                  className="text-white hover:text-fire transition-colors duration-200 text-sm"
                >
                  {locale === 'de' ? 'Kanzlei' : 'Clerk'}
                </Link>
              </li>
              <li>
                <Link
                  href={`/active-members${locale ? `?lang=${locale}` : ''}`}
                  className="text-white hover:text-fire transition-colors duration-200 text-sm"
                >
                  {locale === 'de' ? 'Aktive Mitglieder' : 'Active Members'}
                </Link>
              </li>
              <li>
                <Link
                  href={`/fire-brigade-youth${locale ? `?lang=${locale}` : ''}`}
                  className="text-white hover:text-fire transition-colors duration-200 text-sm"
                >
                  {locale === 'de' ? 'Feuerwehrjugend' : 'Fire Brigade Youth'}
                </Link>
              </li>
              <li>
                <Link
                  href={`/reserve${locale ? `?lang=${locale}` : ''}`}
                  className="text-white hover:text-fire transition-colors duration-200 text-sm"
                >
                  {locale === 'de' ? 'Reserve' : 'Reserve'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: CONTACT */}
          <div>
            <h3 className="text-white text-base font-bold uppercase tracking-wide mb-6">
              {locale === 'de' ? 'KONTAKT' : 'CONTACT'}
            </h3>
            {contactInfoLoading ? (
              <div className="text-white/70 text-sm">
                {locale === 'de' ? 'Lädt...' : 'Loading...'}
              </div>
            ) : contactInfo?.address ? (
              <div
                className="max-h-64 overflow-y-auto pr-2 custom-scrollbar"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(220, 38, 38, 0.5) rgba(255, 255, 255, 0.1)',
                }}
              >
                {(() => {
                  // Convert Lexical content to HTML
                  let addressHtml = ''
                  try {
                    if (contactInfo.address && typeof contactInfo.address === 'object') {
                      if ('root' in contactInfo.address) {
                        addressHtml = convertLexicalToHTML({
                          data: contactInfo.address as Parameters<
                            typeof convertLexicalToHTML
                          >[0]['data'],
                        })
                      }
                    }
                  } catch (error) {
                    console.error('Error converting Lexical content to HTML:', error)
                  }

                  return addressHtml ? (
                    <div
                      className="space-y-2 text-sm text-white max-w-none [&_p]:my-1 [&_p]:text-white [&_a]:text-fire [&_a]:no-underline hover:[&_a]:underline [&_strong]:text-white"
                      dangerouslySetInnerHTML={{ __html: addressHtml }}
                    />
                  ) : (
                    <div className="space-y-2 text-sm text-white">
                      <p>Volunteer Fire Department Droß</p>
                      <p>Schloßstraße 308</p>
                      <p>A-3552 Droß</p>
                      <p>
                        <a
                          href="mailto:dross@feuerwehr.gv.at"
                          className="text-fire hover:text-fire-light transition-colors duration-200"
                        >
                          dross(@)feuerwehr.gv.at
                        </a>
                      </p>
                    </div>
                  )
                })()}
              </div>
            ) : (
              <div
                className="max-h-64 overflow-y-auto pr-2 custom-scrollbar"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(220, 38, 38, 0.5) rgba(255, 255, 255, 0.1)',
                }}
              >
                <div className="space-y-2 text-sm text-white">
                  <p>Volunteer Fire Department Droß</p>
                  <p>Schloßstraße 308</p>
                  <p>A-3552 Droß</p>
                  <p>
                    <a
                      href="mailto:dross@feuerwehr.gv.at"
                      className="text-fire hover:text-fire-light transition-colors duration-200"
                    >
                      dross(@)feuerwehr.gv.at
                    </a>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="border-t border-gray-700 py-4">
        <div className="w-full max-w-[1170px] mx-auto px-4 md:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <div className="text-white text-sm">© {year} Droß Volunteer Fire Department</div>

            {/* Social Media Icons */}
            <div className="flex items-center gap-4">
              {sidebarWidgets?.facebook?.enabled && sidebarWidgets?.facebook?.pageUrl && (
                <a
                  href={sidebarWidgets.facebook.pageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 via-blue-600 to-blue-700 flex items-center justify-center text-white transition-all duration-200 hover:scale-110 hover:shadow-lg"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
              )}
              {sidebarWidgets?.instagram?.enabled && sidebarWidgets?.instagram?.username && (
                <a
                  href={`https://instagram.com/${sidebarWidgets.instagram.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center text-white transition-all duration-200 hover:scale-110 hover:shadow-lg"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              )}
            </div>

            {/* Language Switcher */}
            <div className="relative" ref={langDropdownRef}>
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  langDropdownOpen
                    ? 'bg-fire text-white shadow-lg'
                    : 'bg-gray-800 text-white hover:bg-gray-700 hover:shadow-md'
                } border border-gray-600`}
                aria-expanded={langDropdownOpen}
                aria-label="Select language"
              >
                <span className="text-xl leading-none">{currentLocale.flag}</span>
                <span className="font-semibold tracking-wide">
                  {currentLocale.code.toUpperCase()}
                </span>
                <ArrowIcon
                  direction="down"
                  className={`w-4 h-4 transition-transform duration-300 ${langDropdownOpen ? 'rotate-180' : ''}`}
                  strokeWidth={2.5}
                />
              </button>

              {/* Dropdown Menu */}
              {langDropdownOpen && (
                <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
                  <div className="py-1">
                    {localeOptions.map((option) => (
                      <button
                        type="button"
                        key={option.code}
                        onClick={() => handleLocaleChange(option.code)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                          locale === option.code
                            ? 'bg-red-50 text-fire font-semibold'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-lg leading-none">{option.flag}</span>
                        <span className="flex-1 text-left">{option.label}</span>
                        {locale === option.code && (
                          <svg
                            className="w-4 h-4 text-fire"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Legal Links + Cookie settings */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <Link
                href={`/impressum${locale ? `?lang=${locale}` : ''}`}
                className="text-fire hover:text-fire-light transition-colors duration-200"
              >
                {locale === 'de' ? 'Impressum' : 'Imprint'}
              </Link>
              <span className="hidden md:inline text-gray-600">|</span>
              <Link
                href={locale ? `/datenschutz?lang=${locale}` : '/datenschutz'}
                className="text-fire hover:text-fire-light transition-colors duration-200"
              >
                {locale === 'de' ? 'Datenschutz' : 'Privacy Policy'}
              </Link>
              <span className="hidden md:inline text-gray-600">|</span>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    // Re-open the GDPR banner using the last saved consent values.
                    window.dispatchEvent(new CustomEvent('open-cookie-settings'))
                  }
                }}
                className="text-fire hover:text-fire-light transition-colors duration-200 underline underline-offset-2"
              >
                {locale === 'en' ? 'Cookie settings' : 'Cookie-Einstellungen'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
