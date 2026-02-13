/**
 * Script to fix locale-related database constraints
 * Run this to drop locale constraints before restarting your server
 * 
 * Usage: pnpm tsx src/scripts/fix-locale-constraints.ts
 */

import { getPayload } from 'payload'
import config from '../payload.config.js'

async function fixLocaleConstraints() {
  console.log('Connecting to database...')
  const payload = await getPayload({ config })

  try {
    // Get the database adapter
    const _db = payload.db

    // Execute SQL to drop locale constraints
    console.log('Dropping locale-related constraints...')

    // Note: This requires direct database access
    // You may need to run the SQL manually or use a different approach
    console.log(`
⚠️  Manual SQL execution required:

Run this SQL in your PostgreSQL database:

ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_locales_fk";
ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "locales_id";

Or use psql:
psql $DATABASE_URL -c "ALTER TABLE payload_locked_documents_rels DROP CONSTRAINT IF EXISTS payload_locked_documents_rels_locales_fk;"
    `)

    console.log('\n✅ After running the SQL, restart your dev server')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }

  process.exit(0)
}

fixLocaleConstraints()



