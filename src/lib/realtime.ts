import { supabase } from './supabase';

type ChangeCallback = (table: string) => void;

/**
 * Subscribe to all Postgres changes for a given trip.
 * Note: expense_shares is intentionally excluded — it has no trip_id column
 * so no per-trip filter can be applied. The 'expenses' subscription already
 * triggers balance invalidation via useRealtimeTrip's TABLE_QUERY_MAP logic.
 * Returns an unsubscribe function.
 */
export function subscribeTrip(tripId: string, onChange: ChangeCallback): () => void {
  const tables = ['itinerary_items', 'expenses', 'settlements', 'tasks', 'trip_members'];

  const channel = supabase.channel(`trip:${tripId}`);

  for (const table of tables) {
    const filter = `trip_id=eq.${tripId}`;

    channel.on(
      'postgres_changes' as Parameters<typeof channel.on>[0],
      {
        event: '*',
        schema: 'public',
        table,
        filter,
      },
      () => onChange(table),
    );
  }

  channel.subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      console.log(`[Realtime] Subscribed to trip ${tripId}`);
    }
  });

  return () => {
    supabase.removeChannel(channel);
  };
}
