-- ============================================================
-- Enable Row Level Security on all tables
-- ============================================================
alter table public.profiles enable row level security;
alter table public.trips enable row level security;
alter table public.trip_members enable row level security;
alter table public.trip_invites enable row level security;
alter table public.itinerary_items enable row level security;
alter table public.expenses enable row level security;
alter table public.expense_shares enable row level security;
alter table public.settlements enable row level security;
alter table public.tasks enable row level security;

-- ============================================================
-- profiles policies
-- ============================================================
create policy profiles_select on public.profiles
  for select to authenticated
  using (
    id = auth.uid()
    or exists (
      select 1 from public.trip_members m1
      join public.trip_members m2 on m1.trip_id = m2.trip_id
      where m1.user_id = auth.uid() and m2.user_id = profiles.id
    )
  );

create policy profiles_insert on public.profiles
  for insert to authenticated
  with check (id = auth.uid());

create policy profiles_update_self on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- ============================================================
-- trips policies
-- ============================================================
create policy trips_select on public.trips
  for select to authenticated
  using (public.is_trip_member(id));

create policy trips_insert on public.trips
  for insert to authenticated
  with check (owner_id = auth.uid());

create policy trips_update on public.trips
  for update to authenticated
  using (public.trip_role_of(id) in ('owner', 'admin'))
  with check (public.trip_role_of(id) in ('owner', 'admin'));

create policy trips_delete on public.trips
  for delete to authenticated
  using (owner_id = auth.uid());

-- ============================================================
-- trip_members policies
-- ============================================================
create policy tm_select on public.trip_members
  for select to authenticated
  using (public.is_trip_member(trip_id));

create policy tm_insert on public.trip_members
  for insert to authenticated
  with check (public.trip_role_of(trip_id) in ('owner', 'admin'));

create policy tm_update_admin on public.trip_members
  for update to authenticated
  using (public.trip_role_of(trip_id) in ('owner', 'admin'));

create policy tm_update_self_rsvp on public.trip_members
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy tm_delete on public.trip_members
  for delete to authenticated
  using (public.trip_role_of(trip_id) in ('owner', 'admin') or user_id = auth.uid());

-- ============================================================
-- trip_invites policies
-- ============================================================
create policy ti_select on public.trip_invites
  for select to authenticated
  using (public.trip_role_of(trip_id) in ('owner', 'admin'));

create policy ti_insert on public.trip_invites
  for insert to authenticated
  with check (
    public.trip_role_of(trip_id) in ('owner', 'admin')
    and invited_by = auth.uid()
  );

create policy ti_delete on public.trip_invites
  for delete to authenticated
  using (public.trip_role_of(trip_id) in ('owner', 'admin'));

-- ============================================================
-- itinerary_items policies
-- ============================================================
create policy ii_select on public.itinerary_items
  for select to authenticated
  using (public.is_trip_member(trip_id));

create policy ii_insert on public.itinerary_items
  for insert to authenticated
  with check (public.is_trip_member(trip_id) and created_by = auth.uid());

create policy ii_update on public.itinerary_items
  for update to authenticated
  using (public.trip_role_of(trip_id) in ('owner', 'admin') or created_by = auth.uid());

create policy ii_delete on public.itinerary_items
  for delete to authenticated
  using (public.trip_role_of(trip_id) in ('owner', 'admin') or created_by = auth.uid());

-- ============================================================
-- expenses policies
-- ============================================================
create policy ex_select on public.expenses
  for select to authenticated
  using (public.is_trip_member(trip_id));

create policy ex_insert on public.expenses
  for insert to authenticated
  with check (public.is_trip_member(trip_id) and created_by = auth.uid());

create policy ex_update on public.expenses
  for update to authenticated
  using (created_by = auth.uid() or public.trip_role_of(trip_id) in ('owner', 'admin'));

create policy ex_delete on public.expenses
  for delete to authenticated
  using (created_by = auth.uid() or public.trip_role_of(trip_id) in ('owner', 'admin'));

-- ============================================================
-- expense_shares policies
-- ============================================================
create policy es_select on public.expense_shares
  for select to authenticated
  using (
    exists (
      select 1 from public.expenses e
      where e.id = expense_id and public.is_trip_member(e.trip_id)
    )
  );

create policy es_write on public.expense_shares
  for all to authenticated
  using (
    exists (
      select 1 from public.expenses e
      where e.id = expense_id
        and (e.created_by = auth.uid() or public.trip_role_of(e.trip_id) in ('owner', 'admin'))
    )
  )
  with check (
    exists (
      select 1 from public.expenses e
      where e.id = expense_id
        and (e.created_by = auth.uid() or public.trip_role_of(e.trip_id) in ('owner', 'admin'))
    )
  );

-- ============================================================
-- settlements policies
-- ============================================================
create policy st_select on public.settlements
  for select to authenticated
  using (public.is_trip_member(trip_id));

create policy st_insert on public.settlements
  for insert to authenticated
  with check (
    public.is_trip_member(trip_id)
    and (from_user = auth.uid() or to_user = auth.uid())
  );

create policy st_modify on public.settlements
  for update to authenticated
  using (from_user = auth.uid() or public.trip_role_of(trip_id) in ('owner', 'admin'));

create policy st_delete on public.settlements
  for delete to authenticated
  using (from_user = auth.uid() or public.trip_role_of(trip_id) in ('owner', 'admin'));

-- ============================================================
-- tasks policies
-- ============================================================
create policy tasks_select on public.tasks
  for select to authenticated
  using (public.is_trip_member(trip_id));

create policy tasks_insert on public.tasks
  for insert to authenticated
  with check (public.is_trip_member(trip_id) and created_by = auth.uid());

create policy tasks_update on public.tasks
  for update to authenticated
  using (
    public.trip_role_of(trip_id) in ('owner', 'admin')
    or created_by = auth.uid()
    or assignee_id = auth.uid()
  );

create policy tasks_delete on public.tasks
  for delete to authenticated
  using (public.trip_role_of(trip_id) in ('owner', 'admin') or created_by = auth.uid());
