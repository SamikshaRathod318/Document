-- Add a helper RPC used by the Angular client to determine whether the
-- metadata columns on the documents table are available through PostgREST.
create or replace function public.fn_documents_metadata_supported()
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  missing_count integer;
begin
  select count(*) into missing_count
  from unnest(ARRAY[
    'document_type',
    'class',
    'department',
    'description',
    'is_confidential',
    'effective_date'
  ]) as required(column_name)
  where not exists (
    select 1
    from information_schema.columns c
    where c.table_schema = 'public'
      and c.table_name = 'documents'
      and c.column_name = required.column_name
  );

  return missing_count = 0;
end;
$$;

grant execute on function public.fn_documents_metadata_supported() to anon;
grant execute on function public.fn_documents_metadata_supported() to authenticated;

-- Align defaults with enforced check constraints so fallback inserts never
-- violate the constraint set.
alter table public.documents
  alter column class set default 'general',
  alter column document_type set default 'others';

-- Clean up existing data so every row satisfies the constraint even if older
-- migrations left trailing spaces or unexpected values behind.
update public.documents
  set class = 'general'
  where class is null
     or trim(both from lower(class)) not in ('confidential','general','urgent');

update public.documents
  set class = trim(both from lower(class))
  where class is not null
    and class <> trim(both from lower(class));

update public.documents
  set document_type = 'others'
  where document_type is null
     or trim(both from lower(document_type)) not in ('pdf','image','excel','word','others');

update public.documents
  set document_type = trim(both from lower(document_type))
  where document_type is not null
    and document_type <> trim(both from lower(document_type));

-- Ensure PostgREST is aware of the new function and column defaults.
notify pgrst, 'reload schema';


