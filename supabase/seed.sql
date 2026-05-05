-- ============================================================
-- Dev seed data
-- ============================================================
-- NOTE: This seed requires real auth.users rows.
-- Run this after signing in at least one user in local dev.
-- The UUIDs below are placeholders — replace with real user IDs.

-- Example usage after local sign-in:
-- 1. Sign in via the app to create your auth.users row + profile.
-- 2. Find your user id: select id from auth.users limit 1;
-- 3. Replace the UUID below.

do $$
declare
  v_user_id uuid;
  v_trip_id uuid;
begin
  -- Get the first user (if any)
  select id into v_user_id from auth.users limit 1;
  if v_user_id is null then
    raise notice 'No users found. Sign in first, then re-run seed.';
    return;
  end if;

  -- Ensure profile exists
  insert into public.profiles (id, display_name, email)
  values (v_user_id, 'Demo User', 'demo@example.com')
  on conflict (id) do nothing;

  -- Create a demo trip
  insert into public.trips (id, owner_id, title, destination, description, start_date, end_date, currency)
  values (
    gen_random_uuid(),
    v_user_id,
    'Summer Road Trip 2026',
    'Pacific Coast Highway, CA',
    'An epic road trip down the California coast with friends!',
    '2026-07-10',
    '2026-07-20',
    'USD'
  )
  returning id into v_trip_id;

  -- Add some itinerary items
  insert into public.itinerary_items (trip_id, day_date, start_time, title, category, created_by)
  values
    (v_trip_id, '2026-07-10', '09:00', 'Depart San Francisco', 'travel', v_user_id),
    (v_trip_id, '2026-07-10', '13:00', 'Lunch at In-N-Out Burger', 'food', v_user_id),
    (v_trip_id, '2026-07-11', '10:00', 'Visit Hearst Castle', 'activity', v_user_id),
    (v_trip_id, '2026-07-12', '14:00', 'Check in at Malibu Beach House', 'lodging', v_user_id);

  -- Add a demo task
  insert into public.tasks (trip_id, title, description, status, created_by)
  values
    (v_trip_id, 'Book hotels for all nights', 'Need to confirm Malibu and Santa Barbara stays', 'todo', v_user_id),
    (v_trip_id, 'Create packing list', null, 'done', v_user_id);

  raise notice 'Seed data created. Trip ID: %', v_trip_id;
end $$;
