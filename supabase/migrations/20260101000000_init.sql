-- Enable required extensions
create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- ============================================================
-- Enums
-- ============================================================
create type public.trip_role as enum ('owner', 'admin', 'member');
create type public.rsvp_status as enum ('pending', 'going', 'maybe', 'declined');
create type public.itinerary_category as enum ('travel', 'lodging', 'food', 'activity', 'meeting', 'other');
create type public.expense_category as enum ('lodging', 'food', 'transport', 'activity', 'shopping', 'other');
create type public.split_method as enum ('equal', 'exact', 'percentage', 'shares');
create type public.task_status as enum ('todo', 'in_progress', 'done');

-- ============================================================
-- Tables
-- ============================================================

-- profiles (one per auth user)
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url   text,
  email        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- trips
create table public.trips (
  id                uuid primary key default gen_random_uuid(),
  owner_id          uuid not null references public.profiles(id) on delete restrict,
  title             text not null check (char_length(title) between 1 and 120),
  destination       text,
  description       text,
  cover_image_path  text,
  start_date        date,
  end_date          date,
  currency          char(3) not null default 'USD',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  check (end_date is null or start_date is null or end_date >= start_date)
);
create index trips_owner_id_idx on public.trips(owner_id);

-- trip_members
create table public.trip_members (
  trip_id   uuid not null references public.trips(id) on delete cascade,
  user_id   uuid not null references public.profiles(id) on delete cascade,
  role      public.trip_role not null default 'member',
  rsvp      public.rsvp_status not null default 'pending',
  joined_at timestamptz not null default now(),
  primary key (trip_id, user_id)
);
create index trip_members_user_id_idx on public.trip_members(user_id);

-- trip_invites
create table public.trip_invites (
  id          uuid primary key default gen_random_uuid(),
  trip_id     uuid not null references public.trips(id) on delete cascade,
  email       citext not null,
  role        public.trip_role not null default 'member',
  token       text not null unique default encode(gen_random_bytes(24), 'base64'),
  invited_by  uuid not null references public.profiles(id),
  accepted_at timestamptz,
  expires_at  timestamptz not null default (now() + interval '14 days'),
  created_at  timestamptz not null default now(),
  unique (trip_id, email)
);

-- itinerary_items
create table public.itinerary_items (
  id          uuid primary key default gen_random_uuid(),
  trip_id     uuid not null references public.trips(id) on delete cascade,
  day_date    date not null,
  start_time  time,
  end_time    time,
  title       text not null,
  description text,
  location    text,
  lat         numeric(9, 6),
  lng         numeric(9, 6),
  category    public.itinerary_category not null default 'activity',
  created_by  uuid not null references public.profiles(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index itinerary_trip_day_idx on public.itinerary_items(trip_id, day_date, start_time);

-- expenses
create table public.expenses (
  id            uuid primary key default gen_random_uuid(),
  trip_id       uuid not null references public.trips(id) on delete cascade,
  paid_by       uuid not null references public.profiles(id),
  amount_cents  bigint not null check (amount_cents > 0),
  currency      char(3) not null,
  category      public.expense_category not null default 'other',
  description   text not null,
  occurred_on   date not null default current_date,
  split_method  public.split_method not null default 'equal',
  receipt_path  text,
  created_by    uuid not null references public.profiles(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index expenses_trip_idx on public.expenses(trip_id, occurred_on desc);

-- expense_shares
create table public.expense_shares (
  expense_id  uuid not null references public.expenses(id) on delete cascade,
  user_id     uuid not null references public.profiles(id),
  share_cents bigint not null check (share_cents >= 0),
  primary key (expense_id, user_id)
);

-- settlements
create table public.settlements (
  id           uuid primary key default gen_random_uuid(),
  trip_id      uuid not null references public.trips(id) on delete cascade,
  from_user    uuid not null references public.profiles(id),
  to_user      uuid not null references public.profiles(id),
  amount_cents bigint not null check (amount_cents > 0),
  currency     char(3) not null,
  note         text,
  settled_on   date not null default current_date,
  created_at   timestamptz not null default now(),
  check (from_user <> to_user)
);
create index settlements_trip_idx on public.settlements(trip_id);

-- tasks
create table public.tasks (
  id           uuid primary key default gen_random_uuid(),
  trip_id      uuid not null references public.trips(id) on delete cascade,
  title        text not null,
  description  text,
  assignee_id  uuid references public.profiles(id),
  due_date     date,
  status       public.task_status not null default 'todo',
  completed_at timestamptz,
  created_by   uuid not null references public.profiles(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index tasks_trip_status_idx on public.tasks(trip_id, status, due_date);

-- ============================================================
-- Balance view
-- ============================================================
create or replace view public.trip_balances as
select
  t.id as trip_id,
  p.id as user_id,
  coalesce(paid.total, 0) - coalesce(owed.total, 0) + coalesce(rcv.total, 0) - coalesce(snt.total, 0) as net_cents
from public.trips t
join public.trip_members tm on tm.trip_id = t.id
join public.profiles p on p.id = tm.user_id
left join lateral (
  select sum(amount_cents) total from public.expenses
  where trip_id = t.id and paid_by = p.id
) paid on true
left join lateral (
  select sum(s.share_cents) total
  from public.expense_shares s
  join public.expenses e on e.id = s.expense_id
  where e.trip_id = t.id and s.user_id = p.id
) owed on true
left join lateral (
  select sum(amount_cents) total from public.settlements
  where trip_id = t.id and to_user = p.id
) rcv on true
left join lateral (
  select sum(amount_cents) total from public.settlements
  where trip_id = t.id and from_user = p.id
) snt on true;
