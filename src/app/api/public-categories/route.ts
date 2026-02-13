import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const locale = (searchParams.get('lang') === 'en' ? 'en' : 'de') as 'en' | 'de'

    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    const categoriesResult = await payload.find({
      collection: 'categories',
      where: {
        active: {
          equals: true,
        },
      },
      limit: 100,
      sort: 'name',
      locale,
    })

    return NextResponse.json({
      categories: categoriesResult.docs || [],
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { categories: [], error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

