-- Helper function to let the application discover whether the Supabase
-- documents table already contains the richer metadata columns.
-- Returns true when every required column exists, otherwise it requests
-- PostgREST to reload its schema cache and returns false.
create or replace function public.fn_documents_metadata_supported()
returns boolean
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  missing_count integer;
begin
  select count(*) into missing_count
  from (values
          ('document_type'),
          ('class'),
          ('department'),
          ('description'),
          ('is_confidential'),
          ('effective_date')
       ) as required(column_name)
  where not exists (
    select 1
    from information_schema.columns c
    where c.table_schema = 'public'
      and c.table_name = 'documents'
      and c.column_name = required.column_name
  );

  if missing_count = 0 then
    return true;
  end if;

  perform pg_notify('pgrst', 'reload schema');
  return false;
end;
$$;

grant execute on function public.fn_documents_metadata_supported()
  to anon, authenticated, service_role;

