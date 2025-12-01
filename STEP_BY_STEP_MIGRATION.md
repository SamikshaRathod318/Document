# 🚨 IMPORTANT: Database Migration Required

## ❌ You're Getting This Error:
```
Database migration required! Draft status is not supported.
POST .../rest/v1/documents?select=* 400 (Bad Request)
```

## ✅ FIX THIS NOW - 5 Simple Steps

### Step 1: Open Supabase
1. Go to: **https://app.supabase.com**
2. Login to your account
3. Select your project (kurzoncygmclqbvvavzm)

### Step 2: Open SQL Editor
1. Click **"SQL Editor"** in left sidebar
2. Click **"New Query"** button (top right)

### Step 3: Copy This EXACT SQL Code
Copy ALL of this code (from `COPY_THIS_SQL.sql` file):

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

### Step 4: Run the SQL
1. Paste the code into SQL Editor
2. Click **"Run"** button (or press `Ctrl + Enter`)
3. Wait for success message ✅

### Step 5: Test
1. Go back to your application
2. Refresh the page (`Ctrl + F5`)
3. Try uploading a document
4. ✅ It should work now!

## 🔍 Verify It Worked

After running the migration, run this query to verify:

```sql
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'documents_status_check';
```

You should see: `'draft', 'pending', 'approved', 'rejected', 'completed'` in the check_clause.

## ⚠️ IMPORTANT NOTES

- **You MUST run this migration** - The application won't work without it
- The SQL is safe to run multiple times
- It won't delete any existing data
- Only adds 'draft' status support

## 📁 File Location

The SQL code is in: `doc-project/COPY_THIS_SQL.sql`

Just copy that entire file and paste into Supabase SQL Editor!

## 🆘 Still Having Issues?

1. Make sure you copied the ENTIRE SQL code
2. Check you're in the correct Supabase project
3. Make sure you have admin/owner permissions
4. Try refreshing your browser after migration
5. Check the Supabase SQL Editor for any error messages

---

**Once you run this migration, document upload will work perfectly!** 🎉


