import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import type { Post, Category } from '@/payload-types'
import { getCategoryPath } from '@/lib/categories'

const getPostLink = (post: Post | null | undefined, locale: 'en' | 'de'): string => {
  // Safety check: if post is undefined or null, return a fallback path
  if (!post || typeof post !== 'object') {
    return `/news${locale ? `?lang=${locale}` : ''}`
  }

  try {
    const categoryPath = post.category ? getCategoryPath(post.category as Category | number, locale) : 'news'
    
    // Handle localized slug - it might be a string or an object
    let slug: string | undefined
    if ('slug' in post && post.slug !== undefined && post.slug !== null) {
      if (typeof post.slug === 'string') {
        slug = post.slug
      } else if (typeof post.slug === 'object' && post.slug !== null) {
        // Handle localized slug object
        const slugObj = post.slug as Record<string, string>
        slug = slugObj[locale] || slugObj.en || slugObj.de
      }
    }
    
    if (slug && slug.trim()) {
      return `/${categoryPath}/${slug}${locale ? `?lang=${locale}` : ''}`
    }
    // Fallback to ID if slug is not available
    const postId = ('id' in post && post.id) ? post.id : 'post'
    return `/${categoryPath}/${postId}${locale ? `?lang=${locale}` : ''}`
  } catch (error) {
    console.error('Error generating post link in alert-top-bar:', error, post)
    return `/news${locale ? `?lang=${locale}` : ''}`
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const locale = (searchParams.get('locale') === 'en' ? 'en' : 'de') as 'en' | 'de'

    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    let alertTopBar
    try {
      alertTopBar = await payload.findGlobal({
        slug: 'alert-top-bar',
        locale,
        overrideAccess: false,
      })
    } catch (error) {
      console.warn('Alert top bar not initialized yet:', error)
      return NextResponse.json(
        {
          active: false,
          title: undefined,
          description: undefined,
          color: 'red',
        },
        { status: 200 }
      )
    }

    if (alertTopBar.post) {
      let post: Post | null = null

      try {
        const postId =
          typeof alertTopBar.post === 'object' && alertTopBar.post !== null && 'id' in alertTopBar.post
            ? String(alertTopBar.post.id)
            : String(alertTopBar.post)

        post = await payload.findByID({
          collection: 'posts',
          id: postId,
          depth: 1, // Need depth 1 to get category relationship
          locale,
          overrideAccess: false,
        })
      } catch (error) {
        console.error('Error fetching alert top bar post:', error)
      }

      if (post && post._status === 'published' && post.id) {
        const readMoreLink = {
          url: getPostLink(post, locale),
          text: alertTopBar.readMoreText || (locale === 'en' ? 'Read more' : 'Weiterlesen'),
          openInNewTab: false, // Open in same tab to navigate to the article
        }

        return NextResponse.json(
          {
            active: alertTopBar.active,
            title: alertTopBar.title,
            description: alertTopBar.description,
            color: alertTopBar.color,
            readMoreLink,
          },
          { status: 200 }
        )
      }
    }

    return NextResponse.json(
      {
        active: alertTopBar.active,
        title: alertTopBar.title,
        description: alertTopBar.description,
        color: alertTopBar.color,
      },
      { status: 200 }
    )
  } catch (error: unknown) {
    console.error('Error fetching alert top bar:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)

    return NextResponse.json(
      { error: errorMessage || 'Internal server error' },
      { status: 500 }
    )
  }
}
