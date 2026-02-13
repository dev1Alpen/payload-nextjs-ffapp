/**
 * Force create map-settings table and initialize data
 * Run: npx tsx src/scripts/force-create-map-settings.ts
 */

import { getPayload } from 'payload'
import config from '../payload.config'

async function forceCreate() {
  try {
    console.log('🔧 Loading Payload config...')
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    console.log('✅ Payload initialized')
    console.log('📋 Attempting to create/update map-settings global...')

    // Try to create/update the global - this will create the table if it doesn't exist
    try {
      // First, try to find it
      const existing = await payload.findGlobal({
        slug: 'map-settings',
        overrideAccess: true,
      }).catch(() => null)

      if (existing && existing.id) {
        console.log('✅ map-settings global already exists in database')
        console.log('Current data:', JSON.stringify(existing, null, 2))
        return
      }

      console.log('📝 Creating map-settings global...')

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

      const result = await payload.findGlobal({
        slug: 'map-settings',
        overrideAccess: true,
      })

      console.log('✅ SUCCESS! map-settings global created and initialized')
      console.log('Result:', JSON.stringify(result, null, 2))
    } catch (error: any) {
      const errorMsg = error?.message || String(error)
      console.error('❌ Error:', errorMsg)
      
      if (errorMsg.includes('does not exist') || errorMsg.includes('relation') || errorMsg.includes('map_settings')) {
        console.error('\n⚠️  The database table does not exist.')
        console.error('📌 SOLUTION: You MUST restart your development server:')
        console.error('   1. Stop the server (Ctrl+C or Cmd+C)')
        console.error('   2. Run: npm run dev (or pnpm dev)')
        console.error('   3. Wait for the server to fully start')
        console.error('   4. The table will be auto-created, then run this script again')
        process.exit(1)
      } else {
        throw error
      }
    }

    process.exit(0)
  } catch (error) {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  }
}

forceCreate()

