/**
 * Script to initialize map-settings global
 * Run this with: npx tsx src/scripts/init-map-settings.ts
 */

import { getPayload } from 'payload'
import config from '../payload.config'

async function initMapSettings() {
  try {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    console.log('Checking map-settings global...')

    // Check if global already exists
    const existing = await payload
      .findGlobal({
        slug: 'map-settings',
        overrideAccess: true,
      })
      .catch(() => null)

    if (existing && existing.id) {
      console.log('✅ map-settings global already exists')
      console.log('Current data:', JSON.stringify(existing, null, 2))
      return
    }

    console.log('Initializing map-settings global...')

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

    console.log('✅ map-settings global initialized successfully')
    console.log('Initialized data:', JSON.stringify(initialized, null, 2))
  } catch (error: unknown) {
    console.error('❌ Error initializing map-settings:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Error details:', errorMessage)
    process.exit(1)
  }
}

initMapSettings()
  .then(() => {
    console.log('Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  })

