# 🔴 REQUIRED: Run Database Migration NOW

## ⚠️ CRITICAL ERROR
Your application **CANNOT** create documents because the database doesn't support 'draft' status.

**Error Message:**
```
Database migration required! Draft status is not supported.
POST .../rest/v1/documents 400 (Bad Request)
```

## ✅ SOLUTION (5 Minutes)

### You MUST run this SQL in Supabase:

1. **Open**: https://app.supabase.com → Your Project → SQL Editor
2. **Copy**: The code from file `MUST_RUN_THIS.sql` (see below)
3. **Paste**: Into SQL Editor
4. **Run**: Click "Run" button
5. **Done**: Refresh your app and try again

---

## 📋 SQL CODE TO COPY:

Open file: **`MUST_RUN_THIS.sql`** and copy ALL the code, then paste into Supabase SQL Editor.

OR copy this:

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

---

## 🎯 After Migration:

✅ Documents will be created as **'draft'**
✅ You can send for approval → becomes **'pending'**
✅ Then approve → becomes **'approved'**

## 🚨 WITHOUT THIS MIGRATION:

❌ **Documents CANNOT be uploaded**
❌ **Application will keep showing errors**
❌ **Nothing will work**

---

**THIS IS REQUIRED - Please run the migration now!**


