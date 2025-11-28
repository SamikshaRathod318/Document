-- Ensure metadata columns exist on documents and refresh PostgREST cache
alter table if exists documents
  add column if not exists document_type text,
  add column if not exists class text,
  add column if not exists department text,
  add column if not exists description text,
  add column if not exists is_confidential boolean default false,
  add column if not exists effective_date date;

-- Backfill null booleans to avoid tri-state issues
update documents
  set is_confidential = coalesce(is_confidential, false)
  where is_confidential is distinct from false;

-- Make sure updated_at stays consistent
update documents
  set updated_at = coalesce(updated_at, created_at, now())
  where updated_at is null;

-- Notify PostgREST / Supabase API to reload schema cache so new columns are visible
notify pgrst, 'reload schema';


