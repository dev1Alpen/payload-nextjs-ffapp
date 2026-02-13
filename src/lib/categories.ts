import type { Payload } from 'payload'
import type { Category } from '@/payload-types'

/**
 * Capitalize the first letter of a string (preserves rest of the string)
 */
function capitalizeFirstLetter(str: string): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Get category label for a given locale
 * Returns the label with the first letter capitalized
 */
export function getCategoryLabel(
  category: Category | number | null | undefined,
  locale: 'en' | 'de' = 'de',
): string {
  if (!category) return ''
  
  // If it's just an ID, we can't get the label without fetching
  if (typeof category === 'number') {
    return ''
  }
  
  let label = ''
  
  // When fetched with locale, name is already a string for that locale
  // When fetched without locale, name might be an object with locale keys
  if (typeof category.name === 'string') {
    label = category.name || ''
  } else if (typeof category.name === 'object' && category.name !== null) {
    // Handle localized name object (when fetched without locale)
    const nameObj = category.name as Record<string, string>
    label = nameObj[locale] || nameObj.en || nameObj.de || ''
  } else {
    // Fallback: try to get any name value
    label = String(category.name || '')
  }
  
  // Capitalize the first letter
  return capitalizeFirstLetter(label)
}

/**
 * Get category slug for a given locale
 */
export function getCategorySlug(
  category: Category | number | null | undefined,
  locale: 'en' | 'de' = 'de',
): string {
  try {
    if (!category) return 'news'
    
    // If it's just an ID, we can't get the slug without fetching
    if (typeof category === 'number') {
      return 'news'
    }
    
    // Safety check: ensure category is an object
    if (typeof category !== 'object' || category === null) {
      return 'news'
    }
    
    // Check if slug property exists before accessing it
    if (!('slug' in category)) {
      return 'news'
    }
    
    // Safely access slug property
    const categoryObj = category as Category
    const slug = categoryObj?.slug
    
    // If slug doesn't exist, return default
    if (slug === undefined || slug === null) {
      return 'news'
    }
    
    // When fetched with locale, slug is already a string for that locale
    if (typeof slug === 'string') {
      return slug || 'news'
    }
    
    // Handle localized slug object (when fetched without locale)
    if (typeof slug === 'object' && slug !== null) {
      const slugObj = slug as Record<string, string>
      return slugObj[locale] || slugObj.en || slugObj.de || 'news'
    }
    
    return 'news'
  } catch (error) {
    console.error('Error getting category slug:', error, category)
    return 'news'
  }
}

/**
 * Get category path for URL routing
 * Uses slug, with fallback to 'news'
 */
export function getCategoryPath(
  category: Category | number | null | undefined,
  locale: 'en' | 'de' = 'de',
): string {
  try {
    const slug = getCategorySlug(category, locale)
    // Map certain slugs to specific paths if needed
    // For now, just use the slug directly
    return slug || 'news'
  } catch (error) {
    console.error('Error getting category path:', error, category)
    return 'news'
  }
}

/**
 * Fetch all active categories
 */
export async function getActiveCategories(payload: Payload): Promise<Category[]> {
  try {
    const result = await payload.find({
      collection: 'categories',
      where: {
        active: {
          equals: true,
        },
      },
      limit: 100,
      sort: 'name',
    })
    return result.docs as Category[]
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

/**
 * Fetch a category by ID
 */
export async function getCategoryById(
  payload: Payload,
  id: number | string,
): Promise<Category | null> {
  try {
    const category = await payload.findByID({
      collection: 'categories',
      id: typeof id === 'string' ? parseInt(id, 10) : id,
    })
    return category as Category
  } catch (error) {
    console.error('Error fetching category:', error)
    return null
  }
}

/**
 * Fetch a category by slug
 */
export async function getCategoryBySlug(
  payload: Payload,
  slug: string,
  locale: 'en' | 'de' = 'de',
): Promise<Category | null> {
  try {
    const result = await payload.find({
      collection: 'categories',
      where: {
        or: [
          {
            'slug.en': {
              equals: slug,
            },
          },
          {
            'slug.de': {
              equals: slug,
            },
          },
        ],
      },
      limit: 1,
    })
    
    if (result.docs.length > 0) {
      return result.docs[0] as Category
    }
    
    return null
  } catch (error) {
    console.error('Error fetching category by slug:', error)
    return null
  }
}

