create table public.profiles (
  id uuid NOT null references auth.users(id) ON delete cascade,
  name varchar,
  email varchar,
  profile_image_url varchar,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (id)
);

alter table public.profiles ENABLE ROW level security;


create policy "profiles are viewable by everyone" on public.profiles FOR select using (true);
create policy "users can update own profile" on public.profiles FOR update using (auth.uid() = id);


create or replace function public.handle_new_user()
returns trigger 
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles(id,name,email,profile_image_url)
  values(
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'profile_image_url','')
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.handle_user_update()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  update public.profiles
  set email = new.email,
    updated_at = now()
  where id = new.id;
  return new;
end;
$$;

create or replace trigger on_auth_user_email_updated
  after update of email on auth.users
  for each row execute procedure public.handle_user_update();
