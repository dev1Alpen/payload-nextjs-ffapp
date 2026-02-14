'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import ArrowIcon from './ArrowIcon'
import { useSharedData } from '@/contexts/SharedDataContext'
import { getCategoryLabel, getCategoryPath as getCategoryPathFromLib } from '@/lib/categories'
import type { Media } from '@/payload-types'

type Locale = 'en' | 'de'

interface NavItem {
  label: string
  href?: string
  hasDropdown?: boolean
  dropdownItems?: { label: string; href: string }[]
  dynamicDropdown?: boolean
  isLabelOnly?: boolean
}

const getBaseNavItems = (locale: Locale): NavItem[] => [
  { label: locale === 'de' ? 'STARTSEITE' : 'HOMEPAGE', href: '/' },
  {
    label: locale === 'de' ? 'ÜBER UNS' : 'ABOUT US',
    href: '/about',
    hasDropdown: true,
    dropdownItems: [
      { label: 'Geschichte', href: '/geschichte' },
      { label: 'Kommando', href: '/kommando' },
      { label: 'Chargen', href: '/clerk' },
      { label: 'Aktive Mitglieder', href: '/active-members' },
      { label: 'Feuerwehrjugend', href: '/fire-brigade-youth' },
      { label: 'Reserve', href: '/reserve' },
    ],
  },
  {
    label: locale === 'de' ? 'AKTUELLES' : 'NEWS',
    href: '/all_posts',
    hasDropdown: true,
    dynamicDropdown: true,
  },
  { label: locale === 'de' ? 'GALERIE' : 'GALLERY', href: '/gallery' },
]

interface NavigationProps {
  initialLocale?: Locale
}

export default function Navigation({ initialLocale = 'de' }: NavigationProps = {}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [searchModalOpen, setSearchModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<
    Array<{
      id: number
      title: string
      slug: string
      category: string | null
      categoryLabel: string
      imageUrl: string | null
      description?: string
    }>
  >([])
  const [isSearching, setIsSearching] = useState(false)
  const { categories, categoriesLoading, pages, siteSettings } = useSharedData()
  const [locale, setLocale] = useState<Locale>(initialLocale)
  const mobileRef = useRef<HTMLDivElement>(null)
  const searchModalRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const getCookieValue = (name: string): string | null => {
      if (typeof document === 'undefined') return null
      const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`))
      return match ? decodeURIComponent(match[2]) : null
    }

    const paramLocale = searchParams?.get('lang')
    if (paramLocale === 'en' || paramLocale === 'de') {
      setLocale(paramLocale)
      return
    }

    if (initialLocale) {
      setLocale(initialLocale)
      return
    }

    const cookieLocale = getCookieValue('locale')
    if (cookieLocale === 'en' || cookieLocale === 'de') {
      setLocale(cookieLocale)
      return
    }

    setLocale('de')
  }, [searchParams, initialLocale])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as HTMLElement

      if (target.tagName === 'A') return
      if (target.tagName === 'BUTTON' || target.closest('button')) return

      let clickedInsideDropdown = false
      Object.values(dropdownRefs.current).forEach((ref) => {
        if (ref && ref.contains(target)) clickedInsideDropdown = true
      })
      if (clickedInsideDropdown) return

      if (mobileRef.current && !mobileRef.current.contains(target)) {
        setMobileOpen(false)
      }

      if (searchModalRef.current && !searchModalRef.current.contains(target)) {
        setSearchModalOpen(false)
        setSearchQuery('')
        setSearchResults([])
      }

      setOpenDropdown(null)
    }

    document.addEventListener('click', handleClickOutside, false)
    return () => {
      document.removeEventListener('click', handleClickOutside, false)
    }
  }, [])

  useEffect(() => {
    if (searchModalOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && searchModalOpen) {
        setSearchModalOpen(false)
        setSearchQuery('')
        setSearchResults([])
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [searchModalOpen])

  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([])
        return
      }

      setIsSearching(true)
      try {
        const searchUrl = `/api/search?q=${encodeURIComponent(searchQuery.trim())}&lang=${locale}`
        const response = await fetch(searchUrl)

        if (response.ok) {
          const data = await response.json()
          setSearchResults(data.posts || [])
        } else {
          setSearchResults([])
        }
      } catch {
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }

    const debounceTimer = setTimeout(performSearch, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery, locale])

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname?.startsWith(href)
  }

  const handleDropdownToggle = (label: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation()
      event.preventDefault()
    }
    setOpenDropdown((current) => (current === label ? null : label))
  }

  const handleSearchResultClick = (post: { id: number; slug: string; category: string | null }) => {
    if (!post || !post.id) return

    try {
      const categoryPath = post.category ? getCategoryPath(post.category) : 'news'
      const postUrl =
        post.slug && post.slug.trim()
          ? `/${categoryPath}/${post.slug}?lang=${locale}`
          : `/${categoryPath}/${post.id}?lang=${locale}`
      router.push(postUrl)
      setSearchModalOpen(false)
      setSearchQuery('')
      setSearchResults([])
    } catch {}
  }

  const getCategoryPath = (category: string): string => {
    const categoryMap: Record<string, string> = {
      news: 'news',
      jugend: 'young',
      ausbildung: 'training',
      bewerb: 'competition',
      bürgerinformation: 'citizen-info',
      chargen: 'ranks',
      einsatz: 'operation',
      event: 'event',
      feuerwehrhaus: 'fire-station',
      fuhrpark: 'vehicle-fleet',
      notruf: 'emergency-call',
      sachgebiete: 'subject-areas',
      sonderdienste: 'special-services',
      sondergeräte: 'special-equipment',
      spenden: 'donations',
      zivilschutz: 'civil-defense',
      übung: 'exercise',
    }
    return categoryMap[category] || 'news'
  }

  const getLogoUrl = (): string => {
    const fallback = '/images/logo.jpg'

    if (!siteSettings?.logo) return fallback

    const logo = siteSettings.logo
    if (typeof logo === 'number') return fallback

    if (typeof logo === 'object' && logo !== null) {
      const media = logo as Media
      if (media.url && typeof media.url === 'string' && media.url.trim()) return media.url
      if (media.filename && typeof media.filename === 'string') return `/media/${media.filename}`
    }

    return fallback
  }

  const logoUrl = getLogoUrl()
  const siteName = siteSettings?.siteName || 'Feuerwehr Droß'
  const logoAlt = siteSettings?.siteName ? `${siteName} Logo` : 'Feuerwehr Droß Logo'

  const navItems: NavItem[] = useMemo(() => {
    const items: NavItem[] = [...getBaseNavItems(locale)]

    const contactLabel = locale === 'de' ? 'KONTAKT' : 'CONTACT'

    if (!pages || pages.length === 0) {
      items.push({ label: contactLabel, href: '/kontakt' })
      return items
    }

    const menuPages = pages.filter((page) => {
      const menuLabel = page.menuLabel
      return (
        menuLabel &&
        ((typeof menuLabel === 'string' && menuLabel.trim()) ||
          (typeof menuLabel === 'object' &&
            menuLabel !== null &&
            Object.values(menuLabel).some((v) => v && typeof v === 'string' && v.trim())))
      )
    })

    if (menuPages.length === 0) {
      items.push({ label: contactLabel, href: '/kontakt' })
      return items
    }

    const getLocalizedValue = (value: any, locale: Locale): string => {
      if (!value) return ''
      if (typeof value === 'string') return value
      if (typeof value === 'object' && value !== null) {
        return value[locale] || value.de || value.en || ''
      }
      return String(value)
    }

    const getTopItemLabel = (page: any): string => getLocalizedValue(page.menuLabel, locale)

    const getSubItemTitle = (page: any): string => {
      const menuLabel = page.menuLabel
      if (menuLabel) return getLocalizedValue(menuLabel, locale)
      return getLocalizedValue(page.title, locale)
    }

    const getPageSlug = (page: any): string => getLocalizedValue(page.slug, locale)

    const getPageId = (page: any): string | number => page.id || ''

    const topItems = menuPages.filter((page) => page.isTopItem === true)
    const subItems = menuPages.filter((page) => page.isTopItem === false)

    topItems.sort((a, b) =>
      getTopItemLabel(a).toLowerCase().localeCompare(getTopItemLabel(b).toLowerCase()),
    )

    topItems.forEach((topItem) => {
      const topItemId = getPageId(topItem)
      const topItemLabel = getTopItemLabel(topItem)
      if (!topItemLabel) return

      const topItemSlug = getPageSlug(topItem)
      const hasContent = topItemSlug && topItemSlug.trim() !== ''

      const children = subItems
        .filter((child) => {
          const childParent = child.menuParent
          if (!childParent) return false
          const parentId =
            typeof childParent === 'object' && childParent !== null
              ? (childParent as any).id || childParent
              : childParent
          return parentId === topItemId || String(parentId) === String(topItemId)
        })
        .sort((a, b) =>
          getSubItemTitle(a).toLowerCase().localeCompare(getSubItemTitle(b).toLowerCase()),
        )

      if (hasContent) {
        if (children.length > 0) {
          items.push({
            label: topItemLabel.toUpperCase(),
            href: `/pages/${topItemSlug}`,
            hasDropdown: true,
            dropdownItems: children.map((child) => ({
              label: getSubItemTitle(child),
              href: `/pages/${getPageSlug(child)}`,
            })),
          })
        } else {
          items.push({
            label: topItemLabel.toUpperCase(),
            href: `/pages/${topItemSlug}`,
          })
        }
      } else {
        if (children.length > 0) {
          items.push({
            label: topItemLabel.toUpperCase(),
            hasDropdown: true,
            dropdownItems: children.map((child) => ({
              label: getSubItemTitle(child),
              href: `/pages/${getPageSlug(child)}`,
            })),
            isLabelOnly: true,
          })
        } else {
          items.push({
            label: topItemLabel.toUpperCase(),
            isLabelOnly: true,
          })
        }
      }
    })

    items.push({ label: contactLabel, href: '/kontakt' })
    return items
  }, [pages, locale])

  return (
    <header className="w-full sticky z-50" style={{ top: 'var(--alert-top-bar-height, 0px)' }}>
      <nav className="bg-fire text-white shadow-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="flex items-center gap-3 group transition-transform hover:scale-105 min-w-0 flex-1 lg:flex-initial"
            >
              {logoUrl && (
                <div className="relative w-11 h-11 flex-shrink-0">
                  <Image src={logoUrl} alt={logoAlt} fill className="object-contain" sizes="44px" />
                </div>
              )}
              <span
                className="min-w-0 truncate font-bold tracking-tight leading-none text-base sm:text-lg md:text-2xl lg:whitespace-nowrap"
                style={{ fontSize: 'clamp(1rem, 2.2vw, 1.5rem)' }}
              >
                {siteName}
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-4 h-full">
              {navItems.map((item) => (
                <div
                  key={item.href || item.label}
                  ref={(el) => {
                    dropdownRefs.current[item.label] = el
                  }}
                  className="relative h-full flex items-center"
                >
                  {item.hasDropdown ? (
                    <div className="relative h-full flex items-center">
                      {item.isLabelOnly ? (
                        <span className="h-full px-2 text-sm font-semibold uppercase tracking-wide flex items-center text-white">
                          <span className="leading-none">{item.label}</span>
                        </span>
                      ) : item.href ? (
                        <Link
                          href={`${item.href}?lang=${locale}`}
                          className={`h-full px-2 text-sm font-semibold uppercase tracking-wide transition-all duration-300 flex items-center relative group ${
                            item.href && isActive(item.href)
                              ? 'text-red-300'
                              : 'text-white hover:text-red-200'
                          }`}
                        >
                          <span className="leading-none">{item.label}</span>
                          {item.href && isActive(item.href) && (
                            <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-red-300" />
                          )}
                          <span className="absolute bottom-0 left-2 h-0.5 bg-red-200 w-0 group-hover:w-[calc(100%-1rem)] transition-all duration-300" />
                        </Link>
                      ) : (
                        <span className="h-full px-2 text-sm font-semibold uppercase tracking-wide flex items-center text-white">
                          <span className="leading-none">{item.label}</span>
                        </span>
                      )}

                      <button
                        onClick={(e) => handleDropdownToggle(item.label, e)}
                        className={`h-full px-0 text-sm transition-all duration-300 flex items-center ${
                          item.href && isActive(item.href)
                            ? 'text-red-300'
                            : 'text-white hover:text-red-200'
                        }`}
                        aria-label="Toggle dropdown"
                      >
                        <ArrowIcon
                          direction="down"
                          className={`w-3.5 h-3.5 transition-transform duration-300 flex-shrink-0 ${
                            openDropdown === item.label ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {openDropdown === item.label && (
                        <div
                          className="absolute top-full left-0 mt-1 bg-fire border border-red-500 rounded-md shadow-lg min-w-[200px] max-h-96 overflow-y-auto z-[100] animate-fade-in animate-slide-in-from-top-2 custom-scrollbar"
                          style={{
                            scrollbarWidth: 'thin',
                            scrollbarColor: 'rgba(255, 255, 255, 0.3) rgba(220, 38, 38, 0.2)',
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="py-2">
                            {item.dynamicDropdown ? (
                              categoriesLoading ? (
                                <div className="px-4 py-2 text-sm text-white/70">
                                  {locale === 'de' ? 'Lädt...' : 'Loading...'}
                                </div>
                              ) : (
                                categories.map((category) => {
                                  const categoryLabel = getCategoryLabel(category, locale)
                                  const categoryPath = getCategoryPathFromLib(category, locale)

                                  return (
                                    <Link
                                      key={category.id}
                                      href={`/${categoryPath}?lang=${locale}`}
                                      className="block px-4 py-2 text-sm text-white hover:bg-red-500 transition-colors cursor-pointer capitalize"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setOpenDropdown(null)
                                      }}
                                    >
                                      {categoryLabel}
                                    </Link>
                                  )
                                })
                              )
                            ) : (
                              item.dropdownItems?.map((subItem) => (
                                <Link
                                  key={subItem.href}
                                  href={`${subItem.href}?lang=${locale}`}
                                  className="block px-4 py-2 text-sm text-white hover:bg-red-500 transition-colors cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setOpenDropdown(null)
                                  }}
                                >
                                  {subItem.label}
                                </Link>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      {item.label === (locale === 'de' ? 'KONTAKT' : 'CONTACT') && (
                        <div className="h-6 w-px bg-white/30 mx-3 flex-shrink-0" />
                      )}
                      {item.isLabelOnly ? (
                        <span className="h-full flex items-center px-4 text-sm font-semibold uppercase tracking-wide text-white">
                          <span className="leading-none">{item.label}</span>
                        </span>
                      ) : item.href ? (
                        <Link
                          href={`${item.href}?lang=${locale}`}
                          className={`h-full flex items-center px-4 text-sm font-semibold uppercase tracking-wide transition-all duration-300 relative group ${
                            item.href && isActive(item.href)
                              ? 'text-red-400'
                              : 'text-white hover:text-red-200'
                          }`}
                        >
                          <span className="leading-none">{item.label}</span>
                          {item.href && isActive(item.href) && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-400" />
                          )}
                          <span className="absolute bottom-0 left-0 h-0.5 bg-red-200 w-0 group-hover:w-full transition-all duration-300" />
                        </Link>
                      ) : (
                        <span className="h-full flex items-center px-4 text-sm font-semibold uppercase tracking-wide text-white">
                          <span className="leading-none">{item.label}</span>
                        </span>
                      )}
                    </>
                  )}
                </div>
              ))}

              <div className="h-6 w-px bg-white/30 mx-3 flex-shrink-0" />
              <button
                type="button"
                onClick={() => setSearchModalOpen(true)}
                className="flex items-center justify-center w-10 h-10 text-white hover:text-red-200 transition-colors"
                aria-label="Search"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </div>

            <div className="lg:hidden flex items-center gap-2 flex-shrink-0 ml-2 min-w-[88px]">
              <button
                type="button"
                onClick={() => setSearchModalOpen(true)}
                className="flex items-center justify-center w-10 h-10 text-white hover:text-red-200 transition-colors"
                aria-label="Search"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
              <button
                type="button"
                className="flex items-center justify-center w-10 h-10 text-white hover:text-red-200 transition-colors"
                onClick={() => setMobileOpen((open) => !open)}
                aria-expanded={mobileOpen}
                aria-label="Toggle navigation"
              >
                <svg
                  className="w-6 h-6 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ transform: mobileOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
                >
                  {mobileOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {searchModalOpen && (
          <div
            className="fixed inset-0 z-[100] flex items-start justify-center px-4 bg-black/50 backdrop-blur-sm animate-fade-in"
            style={{ paddingTop: 'calc(5rem + var(--alert-top-bar-height, 0px))' }}
          >
            <div
              ref={searchModalRef}
              className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-in-from-top-2"
            >
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={locale === 'de' ? 'Suchen...' : 'Search...'}
                    className="w-full px-4 py-3 pl-12 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-gray-900"
                  />
                  <svg
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('')
                        setSearchResults([])
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label="Clear search"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-[60vh] overflow-y-auto">
                {isSearching ? (
                  <div className="p-8 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-600 border-t-transparent"></div>
                    <p className="mt-4 text-gray-600">
                      {locale === 'de' ? 'Suche läuft...' : 'Searching...'}
                    </p>
                  </div>
                ) : searchQuery.trim().length < 2 ? (
                  <div className="p-8 text-center text-gray-500">
                    <svg
                      className="w-12 h-12 mx-auto mb-4 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <p>
                      {locale === 'de'
                        ? 'Geben Sie mindestens 2 Zeichen ein, um zu suchen'
                        : 'Type at least 2 characters to search'}
                    </p>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <svg
                      className="w-12 h-12 mx-auto mb-4 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p>{locale === 'de' ? 'Keine Ergebnisse gefunden' : 'No results found'}</p>
                  </div>
                ) : (
                  <div>
                    <div className="px-4 py-3 text-sm font-semibold text-gray-700 bg-gray-50 border-b border-gray-200">
                      {searchResults.length}{' '}
                      {searchResults.length === 1
                        ? locale === 'de'
                          ? 'Ergebnis'
                          : 'result'
                        : locale === 'de'
                          ? 'Ergebnisse'
                          : 'results'}
                    </div>
                    <ul className="divide-y divide-gray-100">
                      {searchResults.map((post) => (
                        <li key={post.id}>
                          <button
                            type="button"
                            onClick={() => handleSearchResultClick(post)}
                            className="w-full text-left p-4 hover:bg-gray-50 transition-colors group"
                          >
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-gray-100 relative shadow-sm">
                                {post.imageUrl ? (
                                  <Image
                                    src={post.imageUrl}
                                    alt={post.title || 'Post image'}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    sizes="96px"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                                    <svg
                                      className="w-8 h-8 text-gray-400"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                      />
                                    </svg>
                                  </div>
                                )}
                              </div>

                              <div className="flex-1 min-w-0 flex flex-col gap-2">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 mb-1.5 group-hover:text-red-600 transition-colors line-clamp-2 text-base">
                                      {post.title}
                                    </h3>
                                    {post.description && (
                                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                        {post.description}
                                      </p>
                                    )}
                                    {post.categoryLabel && (
                                      <div className="flex items-center gap-2">
                                        <svg
                                          className="w-4 h-4 text-red-600 flex-shrink-0"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                          />
                                        </svg>
                                        <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded">
                                          {post.categoryLabel}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  <ArrowIcon
                                    direction="right"
                                    className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors flex-shrink-0 mt-0.5"
                                  />
                                </div>
                              </div>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-gray-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setSearchModalOpen(false)
                    setSearchQuery('')
                    setSearchResults([])
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  {locale === 'de' ? 'Schließen' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        )}

        {mobileOpen && (
          <div
            ref={mobileRef}
            className="lg:hidden border-t border-red-500 bg-fire animate-slide-in-from-top"
          >
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <div key={item.href || item.label}>
                  {item.hasDropdown ? (
                    <div>
                      <div className="flex items-center">
                        {item.isLabelOnly ? (
                          <span className="flex-1 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white">
                            {item.label}
                          </span>
                        ) : item.href ? (
                          <Link
                            href={`${item.href}?lang=${locale}`}
                            onClick={() => setMobileOpen(false)}
                            className={`flex-1 px-4 py-3 text-sm font-semibold uppercase tracking-wide transition-colors ${
                              item.href && isActive(item.href)
                                ? 'text-red-200 bg-red-500/30'
                                : 'text-white hover:bg-red-500'
                            }`}
                          >
                            {item.label}
                          </Link>
                        ) : (
                          <span className="flex-1 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white">
                            {item.label}
                          </span>
                        )}
                        <button
                          onClick={(e) => handleDropdownToggle(item.label, e)}
                          className={`px-3 py-3 text-sm transition-colors ${
                            item.href && isActive(item.href)
                              ? 'text-red-200'
                              : 'text-white hover:bg-red-500'
                          }`}
                          aria-label="Toggle dropdown"
                        >
                          <ArrowIcon
                            direction="down"
                            className={`w-4 h-4 transition-transform duration-300 ${openDropdown === item.label ? 'rotate-180' : ''}`}
                          />
                        </button>
                      </div>

                      {openDropdown === item.label && (
                        <div
                          className="pl-4 mt-1 space-y-1 animate-fade-in animate-slide-in-from-top-2 max-h-64 overflow-y-auto custom-scrollbar"
                          style={{
                            scrollbarWidth: 'thin',
                            scrollbarColor: 'rgba(255, 255, 255, 0.3) rgba(220, 38, 38, 0.2)',
                          }}
                        >
                          {item.dynamicDropdown ? (
                            categoriesLoading ? (
                              <div className="px-4 py-2 text-sm text-white/70">
                                {locale === 'de' ? 'Lädt...' : 'Loading...'}
                              </div>
                            ) : (
                              categories.map((category) => {
                                const categoryLabel = getCategoryLabel(category, locale)
                                const categoryPath = getCategoryPathFromLib(category, locale)

                                return (
                                  <Link
                                    key={category.id}
                                    href={`/${categoryPath}?lang=${locale}`}
                                    className="block px-4 py-2 text-sm text-white/90 hover:bg-red-500 rounded transition-colors cursor-pointer capitalize"
                                    style={{ touchAction: 'manipulation' }}
                                    onClick={() => {
                                      setOpenDropdown(null)
                                      setMobileOpen(false)
                                    }}
                                  >
                                    {categoryLabel}
                                  </Link>
                                )
                              })
                            )
                          ) : (
                            item.dropdownItems?.map((subItem) => (
                              <Link
                                key={subItem.href}
                                href={`${subItem.href}?lang=${locale}`}
                                className="block px-4 py-2 text-sm text-white/90 hover:bg-red-500 rounded transition-colors cursor-pointer"
                                style={{ touchAction: 'manipulation' }}
                                onClick={() => {
                                  setOpenDropdown(null)
                                  setMobileOpen(false)
                                }}
                              >
                                {subItem.label}
                              </Link>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  ) : item.isLabelOnly ? (
                    <span className="block px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white">
                      {item.label}
                    </span>
                  ) : item.href ? (
                    <Link
                      href={`${item.href}?lang=${locale}`}
                      onClick={() => setMobileOpen(false)}
                      className={`block px-4 py-3 text-sm font-semibold uppercase tracking-wide transition-colors ${
                        item.href && isActive(item.href)
                          ? 'text-red-200 bg-red-500/30'
                          : 'text-white hover:bg-red-500'
                      }`}
                      style={{ touchAction: 'manipulation' }}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className="block px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white">
                      {item.label}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
