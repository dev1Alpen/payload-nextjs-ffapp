import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const locale = (searchParams.get('lang') === 'en' ? 'en' : 'de') as 'en' | 'de'

    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    const pagesResult = await payload.find({
      collection: 'pages',
      where: {
        _status: {
          equals: 'published',
        },
      },
      limit: 100,
      sort: 'title',
      locale,
    })

    return NextResponse.json({
      pages: pagesResult.docs || [],
    })
  } catch (error) {
    console.error('Error fetching pages:', error)
    return NextResponse.json(
      { pages: [], error: 'Failed to fetch pages' },
      { status: 500 }
    )
  }
}

