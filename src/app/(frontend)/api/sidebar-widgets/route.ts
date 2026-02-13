import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const locale = (searchParams.get('lang') === 'en' || searchParams.get('lang') === 'de' 
      ? searchParams.get('lang') 
      : 'de') as 'en' | 'de'

    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    const sidebarWidgets = await payload.findGlobal({
      slug: 'sidebar-widgets',
      locale,
    })

    return NextResponse.json({
      sidebarWidgets: sidebarWidgets || null,
    })
  } catch (error) {
    console.error('Error fetching sidebar widgets:', error)
    return NextResponse.json(
      { sidebarWidgets: null, error: 'Failed to fetch sidebar widgets' },
      { status: 500 }
    )
  }
}

