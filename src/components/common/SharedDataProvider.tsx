'use client'

import React, { useEffect, useState, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'
import { SharedDataContext, type SharedDataContextType } from '@/contexts/SharedDataContext'
import type { Category, ContactInfo, SiteSetting, Page } from '@/payload-types'

interface SharedDataProviderProps {
  children: React.ReactNode
  initialCategories?: Category[]
  initialContactInfo?: ContactInfo | null
  initialSiteSettings?: SiteSetting | null
  initialPages?: Page[]
  initialLocale?: 'en' | 'de'
}

export default function SharedDataProvider({
  children,
  initialCategories,
  initialContactInfo,
  initialSiteSettings,
  initialPages,
  initialLocale = 'de',
}: SharedDataProviderProps) {
  const searchParams = useSearchParams()
  const [categories, setCategories] = useState<Category[]>(initialCategories || [])
  const [categoriesLoading, setCategoriesLoading] = useState(!initialCategories)
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(initialContactInfo || null)
  const [contactInfoLoading, setContactInfoLoading] = useState(!initialContactInfo)
  const [siteSettings, setSiteSettings] = useState<SiteSetting | null>(initialSiteSettings || null)
  const [siteSettingsLoading, setSiteSettingsLoading] = useState(!initialSiteSettings)
  const [pages, setPages] = useState<Page[]>(initialPages || [])
  const [pagesLoading, setPagesLoading] = useState(!initialPages)
  const [locale, setLocale] = useState<'en' | 'de'>(initialLocale)
  const [isPending, startTransition] = useTransition()

  // Get locale from URL params, cookie, or initial locale
  useEffect(() => {
    const getCookieValue = (name: string): string | null => {
      if (typeof document === 'undefined') return null
      const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`))
      return match ? decodeURIComponent(match[2]) : null
    }

    // Priority 1: URL parameter (highest priority)
    const paramLocale = searchParams?.get('lang')
    if (paramLocale === 'en' || paramLocale === 'de') {
      setLocale(paramLocale)
      return
    }

    // Priority 2: Initial locale from server
    if (initialLocale) {
      setLocale(initialLocale)
      return
    }

    // Priority 3: Cookie
    const cookieLocale = getCookieValue('locale')
    if (cookieLocale === 'en' || cookieLocale === 'de') {
      setLocale(cookieLocale)
      return
    }

    // Priority 4: Default to German
    setLocale('de')
  }, [searchParams, initialLocale])

  // Fetch categories if not provided initially or when locale changes
  useEffect(() => {
    // If we have initial categories and locale hasn't changed, skip fetching
    if (initialCategories && locale === initialLocale) {
      setCategoriesLoading(false)
      return
    }

    const fetchCategories = async () => {
      setCategoriesLoading(true)
      try {
        const response = await fetch(`/api/public-categories?lang=${locale}`)
        if (response.ok) {
          const data = await response.json()
          setCategories(data.categories || [])
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setCategoriesLoading(false)
      }
    }

    fetchCategories()
  }, [locale, initialCategories, initialLocale])

  // Fetch contact info if not provided initially or when locale changes
  useEffect(() => {
    // If we have initial contact info and locale hasn't changed, skip fetching
    if (initialContactInfo && locale === initialLocale) {
      setContactInfoLoading(false)
      return
    }

    const fetchContactInfo = async () => {
      setContactInfoLoading(true)
      try {
        const response = await fetch(`/api/contact-info?lang=${locale}`)
        if (response.ok) {
          const data = await response.json()
          setContactInfo(data.contactInfo || null)
        }
      } catch (error) {
        console.error('Error fetching contact info:', error)
      } finally {
        setContactInfoLoading(false)
      }
    }

    fetchContactInfo()
  }, [locale, initialContactInfo, initialLocale])

  // Fetch site settings if not provided initially or when locale changes
  useEffect(() => {
    // If we have initial site settings and locale hasn't changed, skip fetching
    if (initialSiteSettings && locale === initialLocale) {
      setSiteSettingsLoading(false)
      return
    }

    const fetchSiteSettings = async () => {
      setSiteSettingsLoading(true)
      try {
        const response = await fetch(`/api/site-settings?lang=${locale}`)
        if (response.ok) {
          const data = await response.json()
          setSiteSettings(data.siteSettings || null)
        }
      } catch (error) {
        console.error('Error fetching site settings:', error)
      } finally {
        setSiteSettingsLoading(false)
      }
    }

    fetchSiteSettings()
  }, [locale, initialSiteSettings, initialLocale])

  // Fetch pages if not provided initially or when locale changes
  useEffect(() => {
    // If we have initial pages and locale hasn't changed, skip fetching
    if (initialPages && locale === initialLocale) {
      setPagesLoading(false)
      return
    }

    const fetchPages = async () => {
      setPagesLoading(true)
      try {
        const response = await fetch(`/api/published-pages?lang=${locale}`)
        if (response.ok) {
          const data = await response.json()
          setPages(data.pages || [])
        }
      } catch (error) {
        console.error('Error fetching pages:', error)
      } finally {
        setPagesLoading(false)
      }
    }

    fetchPages()
  }, [locale, initialPages, initialLocale])

  const value: SharedDataContextType = {
    categories,
    categoriesLoading,
    contactInfo,
    contactInfoLoading,
    siteSettings,
    siteSettingsLoading,
    pages,
    pagesLoading,
    locale,
  }

  return <SharedDataContext.Provider value={value}>{children}</SharedDataContext.Provider>
}


