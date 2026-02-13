'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Category } from '@/payload-types'
import { getCategoryLabel, getCategoryPath } from '@/lib/categories'

interface CategoryFilterProps {
  categories: (Category | number)[]
  activeCategory: Category | number | string | null
  locale: 'en' | 'de'
  getCategoryLabel: (category: Category | number, locale: 'en' | 'de') => string
  onCategoryChange?: (category: Category | number | string | null) => void
  isPending?: boolean
}

export default function CategoryFilter({ categories, activeCategory, locale, getCategoryLabel, onCategoryChange, isPending = false }: CategoryFilterProps) {
  const pathname = usePathname()
  const isClientSide = !!onCategoryChange

  // Helper to get category ID for comparison
  const getCategoryId = (cat: Category | number): number => {
    return typeof cat === 'number' ? cat : cat.id
  }

  // Helper to get category slug
  const getCategorySlug = (cat: Category | number, loc: 'en' | 'de'): string => {
    if (typeof cat === 'number') return ''
    return getCategoryPath(cat, loc)
  }

  // Helper to check if category is active
  const isCategoryActive = (cat: Category | number): boolean => {
    if (!activeCategory) return false
    
    // If activeCategory is a string (slug), compare by slug
    if (typeof activeCategory === 'string') {
      const catSlug = getCategorySlug(cat, locale)
      return catSlug === activeCategory
    }
    
    // Otherwise compare by ID
    const activeId = typeof activeCategory === 'number' 
      ? activeCategory 
      : activeCategory.id
    return getCategoryId(cat) === activeId
  }

  // Client-side filtering (for all_posts page)
  if (isClientSide) {
    return (
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onCategoryChange!(null)}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 ${
              !activeCategory
                ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {locale === 'de' ? 'Alle' : 'All'}
          </button>
          {categories.map((cat) => {
            if (typeof cat === 'number') return null // Skip if just an ID
            return (
              <button
                key={cat.id}
                onClick={() => onCategoryChange!(cat)}
                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 ${
                  isCategoryActive(cat)
                    ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {getCategoryLabel(cat, locale)}
              </button>
            )
          }).filter(Boolean)}
        </div>
      </div>
    )
  }

  // Server-side navigation (for category pages - fallback)
  return (
    <div className="mb-8">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={`/all_posts${locale ? `?lang=${locale}` : ''}`}
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 ${
            !activeCategory
              ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg scale-105'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {locale === 'de' ? 'Alle' : 'All'}
        </Link>
        {categories.map((cat) => {
          if (typeof cat === 'number') return null // Skip if just an ID
          const categoryPath = getCategoryPath(cat, locale)
          // Use slug in URL path for category pages, or ID for all_posts filtering
          const href = pathname?.includes('/all_posts') 
            ? `/all_posts?category=${cat.id}${locale ? `&lang=${locale}` : ''}`
            : `/${categoryPath}${locale ? `?lang=${locale}` : ''}`
          return (
            <Link
              key={cat.id}
              href={href}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 ${
                isCategoryActive(cat)
                  ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {getCategoryLabel(cat, locale)}
            </Link>
          )
        }).filter(Boolean)}
      </div>
    </div>
  )
}
