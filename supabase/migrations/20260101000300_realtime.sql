-- ============================================================
-- Realtime publication setup
-- ============================================================
-- Add tables to the default supabase_realtime publication
-- Note: supabase_realtime publication is created by Supabase platform.
-- In local dev, create it first if it doesn't exist.
do $$
begin
  if not exists (
    select 1 from pg_publication where pubname = 'supabase_realtime'
  ) then
    create publication supabase_realtime;
  end if;
end $$;

alter publication supabase_realtime add table
  public.trips,
  public.trip_members,
  public.itinerary_items,
  public.expenses,
  public.expense_shares,
  public.settlements,
  public.tasks;
