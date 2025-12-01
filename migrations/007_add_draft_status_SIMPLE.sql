-- SIMPLE VERSION - Run this directly in Supabase SQL Editor if the above doesn't work
-- Add 'draft' status to the documents table status constraint

-- Step 1: Drop all status check constraints
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

-- Step 2: Add new constraint with 'draft' status
ALTER TABLE public.documents
  ADD CONSTRAINT documents_status_check
  CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'completed'));

-- Step 3: Update default status to 'draft'
ALTER TABLE public.documents
  ALTER COLUMN status SET DEFAULT 'draft';

-- Step 4: Reload schema cache (for Supabase PostgREST)
NOTIFY pgrst, 'reload schema';


