import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const locale = (searchParams.get('lang') === 'en' ? 'en' : 'de') as 'en' | 'de'

    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    const contactInfo = await payload.findGlobal({
      slug: 'contact-info',
      locale,
    })

    return NextResponse.json({
      contactInfo: contactInfo || null,
    })
  } catch (error) {
    console.error('Error fetching contact info:', error)
    return NextResponse.json(
      { contactInfo: null, error: 'Failed to fetch contact info' },
      { status: 500 }
    )
  }
}

