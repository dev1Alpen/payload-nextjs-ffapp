'use client'

import { createContext, useContext } from 'react'
import type { Category, ContactInfo, SiteSetting, Page } from '@/payload-types'

export interface SharedDataContextType {
  categories: Category[]
  categoriesLoading: boolean
  contactInfo: ContactInfo | null
  contactInfoLoading: boolean
  siteSettings: SiteSetting | null
  siteSettingsLoading: boolean
  pages: Page[]
  pagesLoading: boolean
  locale: 'en' | 'de'
}

const SharedDataContext = createContext<SharedDataContextType | undefined>(undefined)

export function useSharedData() {
  const context = useContext(SharedDataContext)
  if (context === undefined) {
    throw new Error('useSharedData must be used within a SharedDataProvider')
  }
  return context
}

export { SharedDataContext }


