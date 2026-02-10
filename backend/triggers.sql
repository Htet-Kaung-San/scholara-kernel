-- Enable extensions in 'extensions' schema or public
create extension if not exists pgcrypto schema extensions;
create extension if not exists "uuid-ossp" schema extensions;

-- Create a function to handle new user signups
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public, extensions
as $$
declare
  first_name text;
  last_name text;
begin
  -- Extract metadata with safe fallbacks
  first_name := new.raw_user_meta_data ->> 'firstName';
  last_name := new.raw_user_meta_data ->> 'lastName';

  if first_name is null or first_name = '' then
    first_name := 'Student';
  end if;
  
  if last_name is null then
    last_name := '';
  end if;

  insert into public.profiles (
    id,
    auth_id,
    email,
    first_name,
    last_name
  )
  values (
    gen_random_uuid(), -- Should work with search_path including extensions/pg_catalog
    new.id,
    new.email,
    first_name,
    last_name
  );
  return new;
end;
$$;

-- Create the trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
