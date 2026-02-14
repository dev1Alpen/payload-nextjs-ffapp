'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import ArrowIcon from './ArrowIcon'
import { useSharedData } from '@/contexts/SharedDataContext'
import { getCategoryLabel, getCategoryPath as getCategoryPathFromLib } from '@/lib/categories'
import type { Media } from '@/payload-types'

interface NavItem {
  label: string
  href?: string // Optional for label-only items
  hasDropdown?: boolean
  dropdownItems?: { label: string; href: string }[]
  dynamicDropdown?: boolean // Flag to indicate this dropdown should be populated dynamically
  isLabelOnly?: boolean // Flag to indicate this menu item is a label only (no link)
}

// Base navigation items (pages will be added dynamically)
const baseNavItems: NavItem[] = [
  { label: 'HOMEPAGE', href: '/' },
  {
    label: 'ABOUT US',
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
  { label: 'NEWS', href: '/all_posts', hasDropdown: true, dynamicDropdown: true },
  { label: 'GALLERY', href: '/gallery' },
]

type Locale = 'en' | 'de'

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
  // Get categories, pages, and site settings from shared context
  const { categories, categoriesLoading, pages, pagesLoading, siteSettings } = useSharedData()
  // Initialize with initialLocale (defaults to 'de' if not provided)
  const [locale, setLocale] = useState<Locale>(initialLocale)
  const mobileRef = useRef<HTMLDivElement>(null)
  const searchModalRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

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
    // This ensures navigation matches page content on first load
    // Don't let cookie override the server-determined locale when there's no URL param
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as HTMLElement

      // Don't close if clicking on a link - let the link handle navigation first
      if (target.tagName === 'A') {
        return
      }

      // Don't close if clicking on a button (including dropdown toggle buttons)
      // The button's onClick with stopPropagation will prevent this from firing
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        return
      }

      // Check if click is inside any dropdown container
      // This includes the dropdown menu (but not the button, which we already checked above)
      let clickedInsideDropdown = false
      Object.values(dropdownRefs.current).forEach((ref) => {
        if (ref && ref.contains(target)) {
          clickedInsideDropdown = true
        }
      })

      // Don't close dropdowns if clicking inside a dropdown container
      if (clickedInsideDropdown) {
        return
      }

      if (mobileRef.current && !mobileRef.current.contains(target)) {
        setMobileOpen(false)
      }

      if (searchModalRef.current && !searchModalRef.current.contains(target)) {
        setSearchModalOpen(false)
        setSearchQuery('')
        setSearchResults([])
      }

      // Close dropdowns when clicking outside
      setOpenDropdown(null)
    }

    // Use 'click' instead of 'mousedown' for better mobile compatibility
    // Use bubble phase (false) so button onClick fires first, then we check
    document.addEventListener('click', handleClickOutside, false)
    return () => {
      document.removeEventListener('click', handleClickOutside, false)
    }
  }, [])

  // Focus search input when modal opens and handle Escape key
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

  // Categories are now provided by SharedDataContext, no need to fetch here

  // Search posts when query changes
  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([])
        return
      }

      setIsSearching(true)
      try {
        const searchUrl = `/api/search?q=${encodeURIComponent(searchQuery.trim())}&lang=${locale}`
        console.log('Fetching search results from:', searchUrl)
        const response = await fetch(searchUrl)

        console.log('Search response status:', response.status)

        if (response.ok) {
          const data = await response.json()
          console.log('Search response data:', data)
          setSearchResults(data.posts || [])
        } else {
          const errorText = await response.text()
          console.error('Search API error:', response.status, response.statusText, errorText)
          setSearchResults([])
        }
      } catch (error) {
        console.error('Search error:', error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }

    const debounceTimer = setTimeout(performSearch, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery, locale])

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname?.startsWith(href)
  }

  const handleDropdownToggle = (label: string, event?: React.MouseEvent) => {
    // Stop propagation to prevent document click handler from interfering
    if (event) {
      event.stopPropagation()
      event.preventDefault()
    }
    // Toggle the dropdown using functional update to ensure correct state
    setOpenDropdown((current) => (current === label ? null : label))
  }

  const handleSearchResultClick = (post: { id: number; slug: string; category: string | null }) => {
    // Safety check: ensure post exists and has required properties
    if (!post || !post.id) {
      console.error('Invalid post in search result:', post)
      return
    }

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
    } catch (error) {
      console.error('Error handling search result click:', error, post)
    }
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

  // Helper function to get logo URL from site settings
  const getLogoUrl = (): string => {
    const fallback = '/images/logo.jpg'

    if (!siteSettings?.logo) {
      return fallback
    }

    const logo = siteSettings.logo

    // If logo is just an ID (not populated), return fallback
    if (typeof logo === 'number') {
      return fallback
    }

    // If logo is a Media object
    if (typeof logo === 'object' && logo !== null) {
      const media = logo as Media

      // Try url property first (Vercel Blob or other storage)
      if (media.url && typeof media.url === 'string' && media.url.trim()) {
        return media.url
      }

      // Fallback to filename if url is not available
      if (media.filename && typeof media.filename === 'string') {
        return `/media/${media.filename}`
      }
    }

    return fallback
  }

  // Get logo URL and site name
  const logoUrl = getLogoUrl()
  const siteName = siteSettings?.siteName || 'Feuerwehr Droß'
  const logoAlt = siteSettings?.siteName ? `${siteName} Logo` : 'Feuerwehr Droß Logo'

  // Build navigation items dynamically, including pages with menu configuration
  const navItems: NavItem[] = useMemo(() => {
    const items: NavItem[] = [...baseNavItems]

    if (!pages || pages.length === 0) {
      // Add contact at the end if no pages
      items.push({ label: 'CONTACT', href: '/kontakt' })
      return items
    }

    // Filter pages that have menuLabel (they should appear in menu)
    const menuPages = pages.filter((page) => {
      // Include pages that have a menuLabel set
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
      // Add contact at the end if no menu pages
      items.push({ label: 'CONTACT', href: '/kontakt' })
      return items
    }

    // Helper function to get localized value
    const getLocalizedValue = (value: any, locale: 'en' | 'de'): string => {
      if (!value) return ''
      if (typeof value === 'string') return value
      if (typeof value === 'object' && value !== null) {
        return value[locale] || value['de'] || value['en'] || ''
      }
      return String(value)
    }

    // Helper function to get top item label (from menuLabel field)
    const getTopItemLabel = (page: any): string => {
      // Use menuLabel field for top items
      return getLocalizedValue(page.menuLabel, locale)
    }

    // Helper function to get sub item title (from title or menuLabel field)
    const getSubItemTitle = (page: any): string => {
      // Check for menuLabel override first
      const menuLabel = page.menuLabel
      if (menuLabel) {
        return getLocalizedValue(menuLabel, locale)
      }
      // Use title field for sub items
      return getLocalizedValue(page.title, locale)
    }

    // Helper function to get page slug
    const getPageSlug = (page: any): string => {
      return getLocalizedValue(page.slug, locale)
    }

    // Helper function to get page ID
    const getPageId = (page: any): string | number => {
      return page.id || ''
    }

    // Separate top items from sub items based on isTopItem
    const topItems = menuPages.filter((page) => {
      return page.isTopItem === true
    })

    const subItems = menuPages.filter((page) => {
      return page.isTopItem === false
    })

    // Sort top items alphabetically by label
    topItems.sort((a, b) => {
      const labelA = getTopItemLabel(a).toLowerCase()
      const labelB = getTopItemLabel(b).toLowerCase()
      return labelA.localeCompare(labelB)
    })

    // Build menu items from top items
    topItems.forEach((topItem) => {
      const topItemId = getPageId(topItem)
      const topItemLabel = getTopItemLabel(topItem)

      if (!topItemLabel) return

      // Check if top item has a slug (indicates it has content and should be clickable)
      const topItemSlug = getPageSlug(topItem)
      const hasContent = topItemSlug && topItemSlug.trim() !== ''

      // Find children (sub items) of this top item
      const children = subItems
        .filter((child) => {
          const childParent = child.menuParent
          if (!childParent) return false

          // Handle both object and ID references
          const parentId =
            typeof childParent === 'object' && childParent !== null
              ? (childParent as any).id || childParent
              : childParent

          return parentId === topItemId || String(parentId) === String(topItemId)
        })
        .sort((a, b) => {
          // Sort sub items alphabetically by title
          const titleA = getSubItemTitle(a).toLowerCase()
          const titleB = getSubItemTitle(b).toLowerCase()
          return titleA.localeCompare(titleB)
        })

      if (hasContent) {
        // Top item has content - make it clickable
        if (children.length > 0) {
          // Top item has content AND children - clickable link with dropdown
          const dropdownItems = children.map((child) => {
            const childSlug = getPageSlug(child)
            const childTitle = getSubItemTitle(child)
            return {
              label: childTitle,
              href: `/pages/${childSlug}`,
            }
          })

          items.push({
            label: topItemLabel.toUpperCase(),
            href: `/pages/${topItemSlug}`,
            hasDropdown: true,
            dropdownItems,
          })
        } else {
          // Top item has content but no children - clickable link only
          items.push({
            label: topItemLabel.toUpperCase(),
            href: `/pages/${topItemSlug}`,
          })
        }
      } else {
        // Top item has no content - label only
        if (children.length > 0) {
          // Top item has children but no content - dropdown only
          const dropdownItems = children.map((child) => {
            const childSlug = getPageSlug(child)
            const childTitle = getSubItemTitle(child)
            return {
              label: childTitle,
              href: `/pages/${childSlug}`,
            }
          })

          items.push({
            label: topItemLabel.toUpperCase(),
            hasDropdown: true,
            dropdownItems,
            isLabelOnly: true, // No link, just label
          })
        } else {
          // Top item with no children and no content - just label (no link)
          items.push({
            label: topItemLabel.toUpperCase(),
            isLabelOnly: true,
          })
        }
      }
    })

    // Add contact at the end
    items.push({ label: 'CONTACT', href: '/kontakt' })

    return items
  }, [pages, locale])

  return (
    <header className="w-full sticky z-50" style={{ top: 'var(--alert-top-bar-height, 0px)' }}>
      <nav className="bg-fire text-white shadow-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo/Emblem + Brand Name */}
            <Link
              href="/"
              className="flex items-center gap-3 group transition-transform hover:scale-105 min-w-0 flex-1 lg:flex-initial"
            >
              {/* Logo Image */}
              {logoUrl && (
                <div className="relative w-11 h-11 flex-shrink-0">
                  <Image src={logoUrl} alt={logoAlt} fill className="object-contain" sizes="44px" />
                </div>
              )}

              {/* Brand Name */}
              <span className="text-xl md:text-2xl font-bold tracking-tight truncate leading-none max-w-[calc(100vw-12rem)] lg:max-w-none lg:whitespace-nowrap">
                {siteName}
              </span>
            </Link>

            {/* Right: Navigation Links */}
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
                          {/* Active indicator animation */}
                          {item.href && isActive(item.href) && (
                            <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-red-300" />
                          )}
                          {/* Hover underline animation */}
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

                      {/* Dropdown Menu */}
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
                            {item.dynamicDropdown && item.label === 'NEWS' ? (
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
                      {/* Separator before Contact */}
                      {item.label === 'CONTACT' && (
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
                          {/* Active indicator animation */}
                          {item.href && isActive(item.href) && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-400" />
                          )}
                          {/* Hover underline animation */}
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

              {/* Search Icon Button - where language toggle was */}
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

            {/* Mobile: Search and Menu Buttons */}
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

        {/* Search Modal */}
        {searchModalOpen && (
          <div
            className="fixed inset-0 z-[100] flex items-start justify-center px-4 bg-black/50 backdrop-blur-sm animate-fade-in"
            style={{ paddingTop: 'calc(5rem + var(--alert-top-bar-height, 0px))' }}
          >
            <div
              ref={searchModalRef}
              className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-in-from-top-2"
            >
              {/* Search Input */}
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

              {/* Search Results */}
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
                              {/* Image */}
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

                              {/* Content */}
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

              {/* Close Button */}
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

        {/* Mobile Menu */}
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
                            className={`w-4 h-4 transition-transform duration-300 ${
                              openDropdown === item.label ? 'rotate-180' : ''
                            }`}
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
                          {item.dynamicDropdown && item.label === 'NEWS' ? (
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
                                    onClick={(e) => {
                                      // Allow the link to navigate first
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
                                onClick={(e) => {
                                  // Allow the link to navigate first
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
