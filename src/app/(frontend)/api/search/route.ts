import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { getCategorySlug } from '@/lib/categories'

// Helper function to extract text from Lexical content
function extractTextFromLexical(content: unknown): string {
  if (!content || typeof content !== 'object') return ''
  
  const extractText = (node: unknown): string => {
    if (typeof node === 'string') return node
    if (node && typeof node === 'object' && 'text' in node) {
      return String((node as { text: string }).text)
    }
    if (node && typeof node === 'object' && 'children' in node && Array.isArray((node as { children: unknown[] }).children)) {
      return (node as { children: unknown[] }).children.map(extractText).join(' ')
    }
    return ''
  }
  
  if ('root' in content && content.root) {
    return extractText(content.root)
  }
  
  return ''
}

// Helper function to truncate text to max words
function truncateWords(text: string, maxWords: number): string {
  if (!text) return ''
  const words = text.trim().split(/\s+/)
  if (words.length <= maxWords) return text
  return words.slice(0, maxWords).join(' ') + '...'
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')
    const locale = searchParams.get('lang') || 'de'

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ posts: [] })
    }

    const searchTerm = query.trim()
    console.log('Search API called with:', { query: searchTerm, locale })

    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    // Category labels for search and formatting
    const categoryLabels: Record<string, { en: string; de: string }> = {
      ausbildung: { en: 'Training', de: 'Ausbildung' },
      bewerb: { en: 'Competition', de: 'Bewerb' },
      bürgerinformation: { en: 'Citizen Information', de: 'Bürgerinformation' },
      chargen: { en: 'Ranks', de: 'Chargen' },
      einsatz: { en: 'Operation', de: 'Einsatz' },
      event: { en: 'Event', de: 'Event' },
      feuerwehrhaus: { en: 'Fire Station', de: 'Feuerwehrhaus' },
      fuhrpark: { en: 'Vehicle Fleet', de: 'Fuhrpark' },
      jugend: { en: 'Youth', de: 'Jugend' },
      news: { en: 'News', de: 'News' },
      notruf: { en: 'Emergency Call', de: 'Notruf' },
      sachgebiete: { en: 'Subject Areas', de: 'Sachgebiete' },
      sonderdienste: { en: 'Special Services', de: 'Sonderdienste' },
      sondergeräte: { en: 'Special Equipment', de: 'Sondergeräte' },
      spenden: { en: 'Donations', de: 'Spenden' },
      zivilschutz: { en: 'Civil Defense', de: 'Zivilschutz' },
      übung: { en: 'Exercise', de: 'Übung' },
    }

    // Get all published posts and filter by search term
    // This approach is more reliable across different databases
    const { docs: allPosts } = await payload.find({
      collection: 'posts',
      where: {
        _status: {
          equals: 'published',
        },
      },
      limit: 100,
      depth: 1, // Need depth 1 to get featuredImage
      locale: locale as 'en' | 'de',
    })

    console.log('Total published posts found:', allPosts.length)

    // Filter posts by search term (case-insensitive) - search in title, category, and content
    const searchLower = searchTerm.toLowerCase()
    let posts = allPosts.filter((post) => {
      const title = (post.title || '').toLowerCase()
      const categorySlug = getCategorySlug(post.category, locale as 'en' | 'de')
      const categoryLabel = categoryLabels[categorySlug]?.[locale as 'en' | 'de'] || categorySlug
      const categoryLabelLower = categoryLabel.toLowerCase()
      
      // Extract text from content for searching
      const contentText = extractTextFromLexical(post.content).toLowerCase()
      
      return (
        title.includes(searchLower) || 
        categoryLabelLower.includes(searchLower) || 
        categorySlug.toLowerCase().includes(searchLower) ||
        contentText.includes(searchLower)
      )
    })

    // If no results in requested locale, try the other locale
    if (posts.length === 0) {
      const fallbackLocale = locale === 'de' ? 'en' : 'de'
      const { docs: fallbackPosts } = await payload.find({
        collection: 'posts',
        where: {
          _status: {
            equals: 'published',
          },
        },
        limit: 100,
        depth: 1, // Need depth 1 to get featuredImage
        locale: fallbackLocale,
      })

      posts = fallbackPosts.filter((post) => {
        const title = (post.title || '').toLowerCase()
        const categorySlug = getCategorySlug(post.category, fallbackLocale)
        const categoryLabel = categoryLabels[categorySlug]?.[fallbackLocale] || categorySlug
        const categoryLabelLower = categoryLabel.toLowerCase()
        
        // Extract text from content for searching
        const contentText = extractTextFromLexical(post.content).toLowerCase()
        
        return (
          title.includes(searchLower) || 
          categoryLabelLower.includes(searchLower) || 
          categorySlug.toLowerCase().includes(searchLower) ||
          contentText.includes(searchLower)
        )
      })
    }

    // Limit to 10 results
    posts = posts.slice(0, 10)

    console.log('Search found', posts.length, 'posts')

    // Format results
    const formattedPosts = posts.map((post) => {
      const categorySlug = getCategorySlug(post.category, locale as 'en' | 'de')
      const categoryLabel = categoryLabels[categorySlug]?.[locale as 'en' | 'de'] || categorySlug
      
      // Get image URL
      let imageUrl = null
      if (post.featuredImage) {
        if (typeof post.featuredImage === 'object' && post.featuredImage.url) {
          imageUrl = post.featuredImage.url
        }
      }
      
      // Extract and truncate description (max 20 words)
      const fullDescription = extractTextFromLexical(post.content)
      const description = truncateWords(fullDescription, 20)
      
      // Handle localized slug - it might be a string or an object
      let slug = ''
      if (post.slug) {
        if (typeof post.slug === 'string') {
          slug = post.slug
        } else if (typeof post.slug === 'object' && post.slug !== null) {
          // Handle localized slug object
          const slugObj = post.slug as Record<string, string>
          slug = slugObj[locale as 'en' | 'de'] || slugObj.en || slugObj.de || ''
        }
      }
      
      return {
        id: post.id,
        title: post.title || '',
        slug: slug,
        category: post.category || null,
        categoryLabel: categoryLabel,
        imageUrl: imageUrl,
        description: description,
      }
    })

    console.log('Formatted posts:', formattedPosts.length)
    return NextResponse.json({ posts: formattedPosts })
  } catch (error: unknown) {
    console.error('Search API error:', error)
    
    // Return empty results on error instead of failing
    return NextResponse.json({ posts: [] })
  }
}

