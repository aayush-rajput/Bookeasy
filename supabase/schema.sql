-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create a Custom Type for User Roles
create type user_role as enum ('admin', 'vendor', 'user');

-- 2. Create Users Table (Extends Supabase Auth)
create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  role user_role default 'user'::user_role,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on Row Level Security (RLS) for users table
alter table public.users enable row level security;

-- Users can read everyone's basic profile
create policy "Public profiles are viewable by everyone."
  on public.users for select
  using ( true );

-- Users can insert their own profile
create policy "Users can insert their own profile."
  on public.users for insert
  with check ( auth.uid() = id );

-- Users can update own profile
create policy "Users can update own profile."
  on public.users for update
  using ( auth.uid() = id );

-- 3. Create Spaces Table
create type space_category as enum ('Restaurant', 'Event', 'Banquet Hall');

create table public.spaces (
  id uuid default gen_random_uuid() primary key,
  vendor_id uuid references public.users(id) on delete cascade not null,
  category space_category not null default 'Banquet Hall'::space_category,
  name text not null,
  description text,
  price_per_hour numeric not null,
  capacity integer,
  location text not null,
  amenities jsonb default '[]'::jsonb,
  images text[] default '{}'::text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on Row Level Security for spaces
alter table public.spaces enable row level security;

-- Everyone can view spaces
create policy "Spaces are viewable by everyone."
  on public.spaces for select
  using ( true );

-- Only vendors can insert spaces (handled via RLS and functions or app logic, here we restrict by ensuring vendor_id matches auth.uid)
create policy "Vendors can insert their own spaces."
  on public.spaces for insert
  with check ( auth.uid() = vendor_id );

-- Only vendors can update their own spaces
create policy "Vendors can update their own spaces."
  on public.spaces for update
  using ( auth.uid() = vendor_id );

-- Only vendors can delete their own spaces
create policy "Vendors can delete their own spaces."
  on public.spaces for delete
  using ( auth.uid() = vendor_id );

-- 4. Create Bookings Table
create type booking_status as enum ('pending', 'confirmed', 'cancelled');

create table public.bookings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  space_id uuid references public.spaces(id) on delete cascade not null,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  guests integer default 1 not null,
  status booking_status default 'pending'::booking_status,
  total_price numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on Row Level Security for bookings
alter table public.bookings enable row level security;

-- Users can see their own bookings
create policy "Users can view their own bookings."
  on public.bookings for select
  using ( auth.uid() = user_id );

-- Vendors can see bookings for their spaces
create policy "Vendors can view bookings for their spaces."
  on public.bookings for select
  using ( 
    exists (
      select 1 from public.spaces
      where spaces.id = bookings.space_id
      and spaces.vendor_id = auth.uid()
    )
  );

-- Users can insert their own bookings
create policy "Users can create their own bookings."
  on public.bookings for insert
  with check ( auth.uid() = user_id );

-- Users can cancel (update) their own bookings
create policy "Users can update their own bookings."
  on public.bookings for update
  using ( auth.uid() = user_id );

-- Vendors can update bookings for their spaces (e.g. confirm/cancel)
create policy "Vendors can update bookings for their spaces."
  on public.bookings for update
  using ( 
    exists (
      select 1 from public.spaces
      where spaces.id = bookings.space_id
      and spaces.vendor_id = auth.uid()
    )
  );

-- 5. Trigger to automatically create a user profile when a new user signs up in auth.users
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Insert demo data for spaces
-- Note: We can't insert demo spaces yet without a vendor user. 
-- We will handle demo data through the app once you sign in.
