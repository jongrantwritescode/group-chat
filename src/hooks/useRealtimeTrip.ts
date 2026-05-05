import { useEffect } from 'react';
import { useQueryClient, type QueryKey } from '@tanstack/react-query';
import { subscribeTrip } from '@/lib/realtime';

const TABLE_QUERY_MAP: Record<string, (tripId: string) => QueryKey> = {
  itinerary_items: (tripId) => ['itinerary', tripId],
  expenses: (tripId) => ['expenses', tripId],
  expense_shares: (tripId) => ['expenses', tripId],
  settlements: (tripId) => ['settlements', tripId],
  tasks: (tripId) => ['tasks', tripId],
  trip_members: (tripId) => ['members', tripId],
};

export function useRealtimeTrip(tripId: string) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!tripId) return;

    const unsubscribe = subscribeTrip(tripId, (table) => {
      const getKey = TABLE_QUERY_MAP[table];
      if (getKey) {
        qc.invalidateQueries({ queryKey: getKey(tripId) });
      }
      // Also invalidate balances on expense/settlement changes
      if (table === 'expenses' || table === 'expense_shares' || table === 'settlements') {
        qc.invalidateQueries({ queryKey: ['balances', tripId] });
      }
      // Invalidate trip detail on member changes
      if (table === 'trip_members') {
        qc.invalidateQueries({ queryKey: ['trip', tripId] });
      }
    });

    return unsubscribe;
  }, [tripId, qc]);
}
