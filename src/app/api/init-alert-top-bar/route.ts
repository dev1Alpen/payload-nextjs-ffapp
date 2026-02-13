import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function POST(request: NextRequest) {
  try {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    // Check if global already exists
    const existing = await payload
      .findGlobal({
        slug: 'alert-top-bar',
        overrideAccess: true,
      })
      .catch(() => null)

    if (existing && existing.id) {
      return NextResponse.json(
        { message: 'Alert top bar global already exists', data: existing },
        { status: 200 }
      )
    }

    // Initialize for English locale
    await payload.updateGlobal({
      slug: 'alert-top-bar',
      data: {
        active: false,
        color: 'red',
        title: 'Live alert',
        description: 'This is a default alert message.',
        readMoreText: 'Read more',
      },
      locale: 'en',
      overrideAccess: true,
    })

    // Initialize for German locale
    await payload.updateGlobal({
      slug: 'alert-top-bar',
      data: {
        active: false,
        color: 'red',
        title: 'Live-Alarm',
        description: 'Dies ist eine Standard-Warnmeldung.',
        readMoreText: 'Weiterlesen',
      },
      locale: 'de',
      overrideAccess: true,
    })

    const initialized = await payload.findGlobal({
      slug: 'alert-top-bar',
      overrideAccess: true,
    })

    return NextResponse.json(
      {
        message: 'Alert top bar global initialized successfully',
        data: initialized,
      },
      { status: 200 }
    )
  } catch (error: unknown) {
    console.error('Error initializing alert top bar:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)

    return NextResponse.json(
      { error: errorMessage || 'Internal server error' },
      { status: 500 }
    )
  }
}
