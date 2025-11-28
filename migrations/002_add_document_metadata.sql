-- Add metadata columns for documents
alter table documents
  add column if not exists document_type text,
  add column if not exists class text,
  add column if not exists department text,
  add column if not exists description text,
  add column if not exists is_confidential boolean default false,
  add column if not exists effective_date date;

-- Backfill timestamps for existing rows
update documents
  set updated_at = now()
  where updated_at is null;

