# 🔧 Database Migration Fix - Complete Guide

## ❌ Error You're Getting:
```
Database migration required! Draft status is not supported. 
Please run the migration file: migrations/007_add_draft_status_SIMPLE.sql
```

## ✅ Solution: Run SQL Migration

### Quick Steps:

1. **Open Supabase Dashboard**
   - Go to: https://app.supabase.com
   - Select your project
   - Click **"SQL Editor"** → **"New Query"**

2. **Copy SQL Code**
   - Open file: `COPY_THIS_SQL.sql` in your project
   - Copy ALL the SQL code from that file
   - OR copy from `RUN_THIS_SQL.sql`

3. **Paste & Run**
   - Paste the SQL into Supabase SQL Editor
   - Click **"Run"** button
   - Wait for success ✅

4. **Done!**
   - Go back to your app
   - Try uploading a document
   - It should work now! 🎉

## 📋 SQL Code (Copy This):

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

## ✅ What This Does:

1. Removes old constraint (doesn't allow 'draft')
2. Adds new constraint (allows 'draft', 'pending', 'approved', 'rejected', 'completed')
3. Sets default status to 'draft' for new documents
4. Reloads database schema

## 📊 After Migration:

### Workflow:
1. **Upload Document** → Status: `draft` ✅
2. **Send for Approval** → Status: `pending` ✅
3. **Approve Document** → Status: `approved` ✅

### Before Migration:
- ❌ Documents can't be created as 'draft'
- ❌ Error occurs when uploading

### After Migration:
- ✅ Documents created as 'draft'
- ✅ Can send for approval → becomes 'pending'
- ✅ Can approve → becomes 'approved'
- ✅ Full workflow works!

## 🔍 Verify Migration Worked:

Run this query in Supabase SQL Editor:
```sql
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'documents_status_check';
```

You should see `'draft'` in the check_clause list.

## 📁 Files Available:

- `COPY_THIS_SQL.sql` - Simple SQL to copy
- `RUN_THIS_SQL.sql` - Complete migration with verification
- `URGENT_FIX_MIGRATION.md` - Detailed instructions
- `migrations/007_add_draft_status_SIMPLE.sql` - Migration file

## 🆘 Still Having Issues?

1. Make sure you copied ALL the SQL code
2. Check you're in the correct Supabase project
3. Verify you have admin permissions
4. Try refreshing your browser after migration
5. Check console for any other errors

---

**Once migration is complete, your document upload will work perfectly!** 🚀


