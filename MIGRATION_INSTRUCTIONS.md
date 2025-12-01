# Migration Instructions - Adding Draft Status

## Problem
You're getting this error when uploading documents:
```
new row for relation "documents" violates check constraint "documents_status_check"
```

This happens because the database doesn't allow 'draft' status yet.

## Solution

You need to run a migration to add 'draft' as a valid status in your database.

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"

### Step 2: Run the Migration

Copy and paste this SQL code into the SQL Editor:

```sql
-- Drop all existing status check constraints
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT constraint_name
        FROM information_schema.table_constraints
        WHERE table_schema = 'public'
          AND table_name = 'documents'
          AND constraint_type = 'CHECK'
          AND constraint_name LIKE '%status%'
    ) LOOP
        EXECUTE 'ALTER TABLE public.documents DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name);
    END LOOP;
END $$;

-- Add new constraint with 'draft' status
ALTER TABLE public.documents
  ADD CONSTRAINT documents_status_check
  CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'completed'));

-- Update default status to 'draft'
ALTER TABLE public.documents
  ALTER COLUMN status SET DEFAULT 'draft';

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
```

### Step 3: Run the Query

Click "Run" or press Ctrl+Enter to execute the migration.

### Step 4: Verify

After running the migration:
1. Try uploading a new document
2. It should now be created with 'draft' status
3. You can then send it for approval to change it to 'pending'

## Alternative: Use Simple Migration File

If you prefer, you can also use the file:
- `migrations/007_add_draft_status_SIMPLE.sql`

Just copy its contents into the Supabase SQL Editor and run it.

## What This Does

1. **Removes old constraint**: Drops any existing status check constraints
2. **Adds new constraint**: Creates a new constraint that includes 'draft' status
3. **Updates default**: Sets default status to 'draft' for new documents
4. **Reloads schema**: Refreshes Supabase cache

After this migration:
- New documents will be created as 'draft' by default
- Draft documents won't show in pending list
- You can send draft documents for approval to make them 'pending'


