-- ============================================================
-- updated_at trigger function
-- ============================================================
create or replace function public.set_updated_at()
  returns trigger
  language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Attach updated_at triggers
create trigger set_updated_at_profiles
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger set_updated_at_trips
  before update on public.trips
  for each row execute function public.set_updated_at();

create trigger set_updated_at_itinerary_items
  before update on public.itinerary_items
  for each row execute function public.set_updated_at();

create trigger set_updated_at_expenses
  before update on public.expenses
  for each row execute function public.set_updated_at();

create trigger set_updated_at_tasks
  before update on public.tasks
  for each row execute function public.set_updated_at();

-- ============================================================
-- Auto-create profile on user signup
-- ============================================================
create or replace function public.handle_new_user()
  returns trigger
  language plpgsql
  security definer
  set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url',
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Auto-add owner as trip_members row
-- ============================================================
create or replace function public.handle_new_trip()
  returns trigger
  language plpgsql
  security definer
  set search_path = public
as $$
begin
  insert into public.trip_members (trip_id, user_id, role, rsvp)
  values (new.id, new.owner_id, 'owner', 'going');
  return new;
end;
$$;

create trigger on_trip_created
  after insert on public.trips
  for each row execute function public.handle_new_trip();

-- ============================================================
-- RLS helper functions (avoid policy recursion)
-- ============================================================
create or replace function public.is_trip_member(_trip uuid)
  returns boolean
  language sql
  stable
  security definer
  set search_path = public
as $$
  select exists (
    select 1 from public.trip_members
    where trip_id = _trip and user_id = auth.uid()
  );
$$;

create or replace function public.trip_role_of(_trip uuid)
  returns public.trip_role
  language sql
  stable
  security definer
  set search_path = public
as $$
  select role from public.trip_members
  where trip_id = _trip and user_id = auth.uid();
$$;

-- ============================================================
-- Atomic invite acceptance
-- ============================================================
create or replace function public.accept_trip_invite(_token text)
  returns uuid
  language plpgsql
  security definer
  set search_path = public
as $$
declare
  v_trip uuid;
  v_role public.trip_role;
begin
  select trip_id, role into v_trip, v_role
  from public.trip_invites
  where token = _token
    and accepted_at is null
    and expires_at > now();

  if v_trip is null then
    raise exception 'invalid_or_expired_invite';
  end if;

  insert into public.trip_members (trip_id, user_id, role)
  values (v_trip, auth.uid(), v_role)
  on conflict (trip_id, user_id) do nothing;

  update public.trip_invites
  set accepted_at = now()
  where token = _token;

  return v_trip;
end;
$$;

-- ============================================================
-- Atomic expense + shares creation
-- ============================================================
create or replace function public.create_expense(
  _trip_id      uuid,
  _paid_by      uuid,
  _amount_cents bigint,
  _currency     char(3),
  _category     public.expense_category,
  _description  text,
  _occurred_on  date,
  _split_method public.split_method,
  _shares       jsonb   -- [{user_id: uuid, share_cents: bigint}]
)
  returns uuid
  language plpgsql
  security invoker
as $$
declare
  v_id    uuid;
  v_total bigint;
begin
  select sum((s ->> 'share_cents')::bigint)
  into v_total
  from jsonb_array_elements(_shares) s;

  if v_total <> _amount_cents then
    raise exception 'shares_do_not_sum';
  end if;

  insert into public.expenses (
    trip_id, paid_by, amount_cents, currency, category,
    description, occurred_on, split_method, created_by
  )
  values (
    _trip_id, _paid_by, _amount_cents, _currency, _category,
    _description, _occurred_on, _split_method, auth.uid()
  )
  returning id into v_id;

  insert into public.expense_shares (expense_id, user_id, share_cents)
  select
    v_id,
    (s ->> 'user_id')::uuid,
    (s ->> 'share_cents')::bigint
  from jsonb_array_elements(_shares) s;

  return v_id;
end;
$$;
