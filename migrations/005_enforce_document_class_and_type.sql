-- Ensure the documents table has enforced defaults and validation for class
-- and document_type while remaining idempotent for repeated migrations.

alter table public.documents
  alter column class set default 'others ';

alter table public.documents
  alter column document_type set default ' others';

update public.documents
  set class = 'general'
  where class is null;

update public.documents
  set document_type = 'pdf'
  where document_type is null;

do $$
begin
  alter table public.documents
    add constraint documents_class_check
    check (class in ('confidential', 'general', 'urgent'));
exception
  when duplicate_object then
    null;
end
$$;

do $$
begin
  alter table public.documents
    add constraint documents_document_type_check
    check (document_type in ('pdf','image','excel','word','others'));
exception
  when duplicate_object then
    null;
end
$$;

