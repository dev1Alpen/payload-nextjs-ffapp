'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Category } from '@/payload-types'
import { getCategoryLabel, getCategoryPath } from '@/lib/categories'
import ArrowIcon from '@/components/common/ArrowIcon'

interface CategorySearchProps {
  categories: (Category | number)[]
  locale?: 'en' | 'de'
  activeCategory?: Category | number | string | null
}

export default function CategorySearch({ categories, locale = 'de', activeCategory = null }: CategorySearchProps) {
  const [searchQuery, setSearchQuery] = useState('')

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

  // Sort categories: active category first, then others
  const sortedCategories = [...categories].sort((a, b) => {
    if (activeCategory) {
      if (isCategoryActive(a)) return -1
      if (isCategoryActive(b)) return 1
    }
    return 0
  })

  const filteredCategories = sortedCategories.filter((category) => {
    const label = getCategoryLabel(category, locale).toLowerCase()
    const query = searchQuery.toLowerCase()
    const slug = typeof category === 'number' ? '' : getCategorySlug(category, locale).toLowerCase()
    return label.includes(query) || slug.includes(query)
  })

  return (
    <>
      <div className="mb-5 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="search"
          placeholder={locale === 'de' ? 'Kategorien durchsuchen...' : 'Search categories...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 text-sm transition-all bg-gray-50 focus:bg-white"
        />
      </div>

      <ul
        className="space-y-1.5 max-h-96 overflow-y-auto custom-scrollbar"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgb(220, 38, 38) #f3f4f6',
        }}
      >
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category, index) => {
            if (typeof category === 'number') return null // Skip if just an ID
            const isActive = isCategoryActive(category)
            const categoryPath = getCategoryPath(category, locale)
            const categorySlug = getCategorySlug(category, locale)
            return (
              <li key={category.id || index}>
                <Link
                  href={`/${categoryPath}${locale ? `?lang=${locale}` : ''}`}
                  className={`flex items-center transition-all duration-200 group text-sm py-2.5 px-3 rounded-lg ${
                    isActive
                      ? 'text-red-600 bg-red-50 font-semibold border-l-4 border-red-600'
                      : 'text-gray-700 hover:text-red-600 hover:bg-red-50'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full mr-3 transition-all duration-200 ${
                      isActive
                        ? 'bg-fire scale-125 shadow-md'
                        : 'bg-gray-300 group-hover:bg-fire group-hover:scale-125 group-hover:shadow-md'
                    }`}
                  />
                  <span className={`${isActive ? 'font-semibold' : 'group-hover:font-semibold'} transition-all`}>
                    {getCategoryLabel(category, locale) || `Category ${category.id}`}
                  </span>
                  <ArrowIcon
                    direction="right"
                    className={`w-4 h-4 ml-auto transition-all duration-200 ${
                      isActive
                        ? 'text-red-600 opacity-100'
                        : 'text-gray-400 group-hover:text-red-600 opacity-0 group-hover:opacity-100'
                    }`}
                  />
                </Link>
              </li>
            )
          }).filter(Boolean)
        ) : (
          <li className="text-center py-4 text-gray-500 text-sm">
            {locale === 'de' ? 'Keine Kategorien gefunden' : 'No categories found'}
          </li>
        )}
      </ul>
    </>
  )
}

