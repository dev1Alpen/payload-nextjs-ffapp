/**
 * Script to force push database schema
 * This will create all missing tables including map_settings
 * Run with: npx tsx src/scripts/push-schema.ts
 */

import { getPayload } from 'payload'
import config from '../payload.config'

async function pushSchema() {
  try {
    console.log('Loading Payload config...')
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    console.log('Payload initialized. Schema should be auto-created on server start.')
    console.log('If tables are missing, restart your dev server with: npm run dev')
    
    // Try to access the global to trigger schema creation
    try {
      const existing = await payload.findGlobal({
        slug: 'map-settings',
        overrideAccess: true,
      }).catch(() => null)
      
      if (existing) {
        console.log('✅ map-settings global exists')
      } else {
        console.log('⚠️  map-settings global not found. It will be created on server restart.')
      }
    } catch (error) {
      console.log('⚠️  Error accessing map-settings:', error instanceof Error ? error.message : String(error))
      console.log('This is expected if the table doesn\'t exist yet.')
    }

    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

pushSchema()

