-- ============================================
-- COPY THIS ENTIRE FILE AND RUN IN SUPABASE SQL EDITOR
-- ============================================

-- Fix: Add 'draft' status support to documents table

-- Step 1: Remove all status check constraints
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
        RAISE NOTICE 'Dropped constraint: %', r.constraint_name;
    END LOOP;
END $$;

-- Step 2: Add new constraint that allows 'draft' status
ALTER TABLE public.documents
  ADD CONSTRAINT documents_status_check
  CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'completed'));

-- Step 3: Set default status to 'draft' for new documents
ALTER TABLE public.documents
  ALTER COLUMN status SET DEFAULT 'draft';

-- Step 4: Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- Step 5: Verify the constraint was created
SELECT 
    constraint_name, 
    check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'documents_status_check';

-- ============================================
-- If you see the constraint with 'draft' in the check_clause, you're done!
-- Try uploading a document now - it should work!
-- ============================================


