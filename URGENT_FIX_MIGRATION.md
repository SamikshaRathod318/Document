# ⚠️ URGENT: Database Migration Required

## Error You're Seeing:
```
Database migration required! Draft status is not supported. 
Please run the migration file: migrations/007_add_draft_status_SIMPLE.sql
```

## ✅ Quick Fix (5 Minutes)

### Step 1: Open Supabase Dashboard
1. Go to your Supabase project: https://app.supabase.com
2. Select your project
3. Click on **"SQL Editor"** in the left sidebar

### Step 2: Copy This SQL Code
Copy the ENTIRE code below:

```sql
-- Remove old status constraint
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

-- Set default status to 'draft'
ALTER TABLE public.documents
  ALTER COLUMN status SET DEFAULT 'draft';

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
```

### Step 3: Run the SQL
1. Click **"New Query"** in SQL Editor
2. Paste the SQL code above
3. Click **"Run"** button (or press Ctrl+Enter)
4. Wait for success message

### Step 4: Verify It Worked
Run this verification query:
```sql
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'documents_status_check';
```

You should see `'draft', 'pending', 'approved', 'rejected', 'completed'` in the check_clause.

### Step 5: Test
1. Go back to your application
2. Try uploading a document
3. ✅ It should work now!

## What This Does

1. **Removes** the old constraint that doesn't allow 'draft'
2. **Adds** new constraint that allows 'draft' status
3. **Sets** default status to 'draft' for new documents
4. **Reloads** the database schema

## After Migration

✅ Documents will be created as **'draft'** (not pending)
✅ You can send draft documents for approval
✅ After approval, they become **'pending'**
✅ Then they can be approved to become **'approved'**

## Need Help?

If you get any errors:
1. Make sure you copied the ENTIRE SQL code
2. Check that you're in the correct Supabase project
3. Make sure you have permission to alter tables
4. Try refreshing the page after running migration


