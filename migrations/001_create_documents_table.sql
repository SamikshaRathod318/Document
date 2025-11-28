-- Create documents table with workflow stages
-- Note: If using custom users table instead of auth.users, change the foreign key references
-- from auth.users(id) to users(id) and adjust the data type if needed

create table documents (
  id uuid primary key default gen_random_uuid(),
  file_url text not null,
  title text,
  created_by text, -- Can reference auth.users(id) or users table - adjust as needed
  current_stage text not null default 'clerk'
    check (current_stage in ('clerk', 'senior_clerk', 'accountant', 'admin', 'hod')),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'completed')),
  assigned_to text, -- Can reference auth.users(id) or users table - adjust as needed
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- If using Supabase Auth, uncomment these foreign key constraints:
-- alter table documents add constraint fk_documents_created_by 
--   foreign key (created_by) references auth.users(id) on delete cascade;
-- alter table documents add constraint fk_documents_assigned_to 
--   foreign key (assigned_to) references auth.users(id) on delete cascade;

-- If using custom users table with integer IDs, use this instead:
-- alter table documents alter column created_by type integer using created_by::integer;
-- alter table documents alter column assigned_to type integer using assigned_to::integer;
-- alter table documents add constraint fk_documents_created_by 
--   foreign key (created_by) references users(id) on delete cascade;
-- alter table documents add constraint fk_documents_assigned_to 
--   foreign key (assigned_to) references users(id) on delete cascade;

-- Create index on current_stage for faster queries
create index idx_documents_current_stage on documents(current_stage);

-- Create index on status for faster queries
create index idx_documents_status on documents(status);

-- Create index on created_by for faster queries
create index idx_documents_created_by on documents(created_by);

-- Create index on assigned_to for faster queries
create index idx_documents_assigned_to on documents(assigned_to);

-- Create function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger to automatically update updated_at
create trigger update_documents_updated_at
  before update on documents
  for each row
  execute function update_updated_at_column();

