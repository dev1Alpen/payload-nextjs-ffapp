import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const locale = (searchParams.get('lang') === 'en' ? 'en' : 'de') as 'en' | 'de'

    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    const siteSettings = await payload.findGlobal({
      slug: 'site-settings',
      locale,
      depth: 1, // Populate logo and favicon relationships
    })

    return NextResponse.json({
      siteSettings: siteSettings || null,
    })
  } catch (error) {
    console.error('Error fetching site settings:', error)
    return NextResponse.json(
      { siteSettings: null, error: 'Failed to fetch site settings' },
      { status: 500 }
    )
  }
}

