# Quick Fix - Run This SQL Now

## Problem
You're getting this error when uploading documents:
```
new row for relation "documents" violates check constraint "documents_status_check"
```

## Solution - Run This SQL

**Copy and paste this into Supabase SQL Editor and click Run:**

```sql
-- Step 1: Remove old status constraint
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
          AND (constraint_name LIKE '%status%' OR constraint_name LIKE '%documents%')
    ) LOOP
        EXECUTE 'ALTER TABLE public.documents DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name);
    END LOOP;
END $$;

-- Step 2: Add new constraint with 'draft' status
ALTER TABLE public.documents
  ADD CONSTRAINT documents_status_check
  CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'completed'));

-- Step 3: Set default to 'draft'
ALTER TABLE public.documents
  ALTER COLUMN status SET DEFAULT 'draft';

-- Step 4: Reload schema
NOTIFY pgrst, 'reload schema';

-- Verify it worked
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%status%';
```

## After Running

1. ✅ Try uploading a document - it should work!
2. ✅ Documents will be created as 'draft'
3. ✅ You can send them for approval to make them 'pending'

## If Still Not Working

Check the console warnings - the code will automatically use 'pending' as a fallback, but you should still run the migration for full functionality.


