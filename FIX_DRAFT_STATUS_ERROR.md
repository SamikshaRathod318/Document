# Fix: Document Upload Error - Draft Status Issue

## Problem Summary

When uploading a new document, you get this error:
```
new row for relation "documents" violates check constraint "documents_status_check"
```

**Root Cause**: The database constraint doesn't allow 'draft' status yet. The code is trying to create documents with 'draft' status, but the database only allows: 'pending', 'approved', 'rejected', 'completed'.

## ✅ Fixes Applied to Code

1. ✅ **Document Service Updated** - Now properly normalizes status values to lowercase
2. ✅ **Default Status Changed** - New documents default to 'draft' instead of 'pending'
3. ✅ **Status Normalization** - Added `normalizeStatusValue()` method to ensure consistent status values

## 🔧 Database Migration Required

**You MUST run the database migration** to add 'draft' as a valid status.

### Quick Fix (5 minutes):

1. **Open Supabase Dashboard** → SQL Editor → New Query

2. **Copy and paste this SQL:**

```sql
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

ALTER TABLE public.documents
  ADD CONSTRAINT documents_status_check
  CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'completed'));

ALTER TABLE public.documents
  ALTER COLUMN status SET DEFAULT 'draft';

NOTIFY pgrst, 'reload schema';
```

3. **Click "Run"** (or Ctrl+Enter)

4. **Done!** Try uploading a document again.

## What Changed

### Before:
- Documents created with 'pending' status immediately
- No approval step required

### After:
- Documents created with 'draft' status
- Need to send for approval to become 'pending'
- Draft documents don't show in pending list
- After approval → status becomes 'pending' → shows in pending list

## Files Changed

1. `migrations/007_add_draft_status.sql` - Migration file
2. `migrations/007_add_draft_status_SIMPLE.sql` - Simple version for direct run
3. `src/app/core/services/document.service.ts` - Added status normalization
4. `src/app/features/clerk/components/document-upload/document-upload.component.ts` - Changed default to 'draft'
5. `src/app/features/clerk/models/document.model.ts` - Added 'draft' status type
6. `src/app/features/clerk/components/document-list/document-list.component.ts` - Added draft support

## After Migration

Once you run the migration:
- ✅ New uploads will work without errors
- ✅ Documents will be created as 'draft'
- ✅ You can filter by 'draft' status
- ✅ "Send for Approval" button will appear on draft documents
- ✅ After approval, documents become 'pending' and show in pending list

## Need Help?

If you still get errors after running the migration:
1. Check browser console for exact error message
2. Verify migration ran successfully in Supabase
3. Try refreshing the page (Ctrl+F5)
4. Check that status constraint was updated (query: `SELECT * FROM information_schema.table_constraints WHERE table_name = 'documents' AND constraint_type = 'CHECK';`)


