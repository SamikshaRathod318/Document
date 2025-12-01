# 🚨 START HERE - Database Migration Required

## ⚠️ Your Application is NOT Working!

**Error:** `Database migration required! Draft status is not supported.`

**Reason:** Database doesn't allow 'draft' status yet.

**Solution:** Run the SQL migration (takes 2 minutes)

---

## 📝 QUICK FIX - 3 Steps

### Step 1: Open Supabase SQL Editor
- Go to: https://app.supabase.com
- Select your project
- Click **"SQL Editor"** → **"New Query"**

### Step 2: Copy & Paste SQL
Open file: **`MUST_RUN_THIS.sql`** (in your project folder)

Copy ALL the SQL code from that file and paste into Supabase SQL Editor.

### Step 3: Run & Done!
- Click **"Run"** button (or Ctrl+Enter)
- Wait for success ✅
- Go back to your app and refresh

---

## 📄 SQL Code (Copy This):

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

## ✅ After Migration:

- ✅ Documents upload successfully
- ✅ Created as 'draft' status
- ✅ Can send for approval → 'pending'
- ✅ Can approve → 'approved'

## ❌ Without Migration:

- ❌ Documents CANNOT be uploaded
- ❌ Error keeps appearing
- ❌ Application won't work

---

**PLEASE RUN THE MIGRATION NOW - It's Required!**

File: `MUST_RUN_THIS.sql` or `COPY_THIS_SQL.sql`


