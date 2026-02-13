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
        slug: 'map-settings',
        overrideAccess: true,
      })
      .catch(() => null)

    // Check if it has the new structure
    const hasNewStructure =
      existing &&
      existing.id &&
      Array.isArray((existing as any).mapLocations) &&
      (existing as any).mapLocations.length > 0

    if (hasNewStructure) {
      return NextResponse.json(
        { message: 'Map settings global already exists with new structure', data: existing },
        { status: 200 }
      )
    }

    // If it exists but has old structure, migrate it
    if (existing && existing.id) {
      const oldData = existing as any
      const migrationData = {
        enabled: oldData.enabled ?? true,
        mapType: oldData.mapType || 'google',
        mapLocations: [
          {
            title: 'Main Location',
            address: oldData.mapAddress || 'Schloßstraße 308, A-3552 Droß, Austria',
            googleMapsEmbedUrl:
              oldData.googleMapsEmbedUrl ||
              'https://www.google.com/maps?q=Schloßstraße+308,+3552+Droß,+Austria&output=embed',
          },
        ],
        displayMode: 'first' as const,
        mapTitle: oldData.mapTitle || 'How to Find Us',
      }

      await payload.updateGlobal({
        slug: 'map-settings',
        data: migrationData,
        locale: 'en',
        overrideAccess: true,
      })

      await payload.updateGlobal({
        slug: 'map-settings',
        data: {
          ...migrationData,
          mapLocations: [
            {
              title: 'Hauptstandort',
              address: oldData.mapAddress || 'Schloßstraße 308, A-3552 Droß, Österreich',
              googleMapsEmbedUrl: migrationData.mapLocations[0].googleMapsEmbedUrl,
            },
          ],
          mapTitle: oldData.mapTitle || 'So finden Sie uns',
        },
        locale: 'de',
        overrideAccess: true,
      })

      const migrated = await payload.findGlobal({
        slug: 'map-settings',
        overrideAccess: true,
      })

      return NextResponse.json(
        { message: 'Map settings migrated from old structure', data: migrated },
        { status: 200 }
      )
    }

    // Initialize for English locale
    await payload.updateGlobal({
      slug: 'map-settings',
      data: {
        enabled: true,
        mapType: 'google',
        mapLocations: [
          {
            title: 'Main Station',
            address: 'Schloßstraße 308, A-3552 Droß, Austria',
            googleMapsEmbedUrl: 'https://www.google.com/maps?q=Schloßstraße+308,+3552+Droß,+Austria&output=embed',
          },
        ],
        displayMode: 'first',
        mapTitle: 'How to Find Us',
      },
      locale: 'en',
      overrideAccess: true,
    })

    // Initialize for German locale
    await payload.updateGlobal({
      slug: 'map-settings',
      data: {
        enabled: true,
        mapType: 'google',
        mapLocations: [
          {
            title: 'Hauptwache',
            address: 'Schloßstraße 308, A-3552 Droß, Österreich',
            googleMapsEmbedUrl: 'https://www.google.com/maps?q=Schloßstraße+308,+3552+Droß,+Austria&output=embed',
          },
        ],
        displayMode: 'first',
        mapTitle: 'So finden Sie uns',
      },
      locale: 'de',
      overrideAccess: true,
    })

    const initialized = await payload.findGlobal({
      slug: 'map-settings',
      overrideAccess: true,
    })

    return NextResponse.json(
      {
        message: 'Map settings global initialized successfully',
        data: initialized,
      },
      { status: 200 }
    )
  } catch (error: unknown) {
    console.error('Error initializing map settings:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)

    return NextResponse.json(
      { error: errorMessage || 'Internal server error' },
      { status: 500 }
    )
  }
}

