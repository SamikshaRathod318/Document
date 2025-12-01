-- Add 'draft' status to the documents table status constraint
-- This allows documents to be created in draft state before being sent for approval

-- Drop any existing status check constraints (they might have different names)
do $$
declare
    constraint_name text;
begin
    -- Find and drop any check constraint on the status column
    for constraint_name in
        select conname
        from pg_constraint
        where conrelid = 'public.documents'::regclass
          and contype = 'c'
          and pg_get_constraintdef(oid) like '%status%'
    loop
        execute format('alter table public.documents drop constraint if exists %I', constraint_name);
    end loop;
end
$$;

-- Add new constraint that includes 'draft' status
alter table public.documents
  add constraint documents_status_check
  check (status in ('draft', 'pending', 'approved', 'rejected', 'completed'));

-- Update the default status to 'draft' for new documents
alter table public.documents
  alter column status set default 'draft';

-- Notify PostgREST to reload schema
notify pgrst, 'reload schema';

