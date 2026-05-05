import { supabase } from './supabase';

type ChangeCallback = (table: string) => void;

/**
 * Subscribe to all Postgres changes for a given trip.
 * Returns an unsubscribe function.
 */
export function subscribeTrip(tripId: string, onChange: ChangeCallback): () => void {
  const tables = ['itinerary_items', 'expenses', 'expense_shares', 'settlements', 'tasks', 'trip_members'];

  const channel = supabase.channel(`trip:${tripId}`);

  for (const table of tables) {
    const filter = table === 'expense_shares' ? undefined : `trip_id=eq.${tripId}`;

    channel.on(
      'postgres_changes' as Parameters<typeof channel.on>[0],
      {
        event: '*',
        schema: 'public',
        table,
        ...(filter ? { filter } : {}),
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
