#!/bin/bash
# Script to fix locale-related database constraints
# Run this before restarting your server

echo "Dropping locale-related constraints..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "Error: DATABASE_URL environment variable is not set"
    echo "Please set it or run: psql <your-connection-string> -f src/scripts/drop-locale-constraints.sql"
    exit 1
fi

# Drop the constraint
psql "$DATABASE_URL" -c "ALTER TABLE payload_locked_documents_rels DROP CONSTRAINT IF EXISTS payload_locked_documents_rels_locales_fk;" 2>/dev/null || echo "Note: Constraint may not exist or already dropped"

echo "✅ Done! You can now restart your dev server"
