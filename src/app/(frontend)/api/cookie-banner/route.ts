import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const locale = (searchParams.get('locale') === 'en' ? 'en' : 'de') as 'en' | 'de'

    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    const cookieBanner = await payload.findGlobal({
      slug: 'cookie-banner',
      locale,
    })

    return NextResponse.json(cookieBanner, { status: 200 })
  } catch (error: unknown) {
    console.error('Error fetching cookie banner:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)

    return NextResponse.json(
      { error: errorMessage || 'Internal server error' },
      { status: 500 }
    )
  }
}

