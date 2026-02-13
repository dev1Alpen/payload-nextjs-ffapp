-- Script to drop locale-related constraints from Payload tables
-- Run this manually in your PostgreSQL database if you encounter migration errors

-- Drop locale foreign key constraints from payload_locked_documents_rels
ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_locales_fk";

-- Drop locale columns if they exist (they might not, depending on your setup)
ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "locales_id";

-- Drop any other locale-related constraints (adjust table names as needed)
-- You may need to check your database for other tables with locale references



