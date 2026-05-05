import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTrips, fetchTrip, createTrip, updateTrip, deleteTrip } from '@/api/trips';
import type { Trip } from '@/types/domain';
import type { Database } from '@/types/database';

type TripInsert = Database['public']['Tables']['trips']['Insert'];
type TripUpdate = Database['public']['Tables']['trips']['Update'];

export function useTrips() {
  return useQuery({
    queryKey: ['trips'],
    queryFn: fetchTrips,
  });
}

export function useTripById(tripId: string) {
  return useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => fetchTrip(tripId),
    enabled: !!tripId,
  });
}

export function useCreateTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ input, ownerId }: { input: Omit<TripInsert, 'owner_id'>; ownerId: string }) =>
      createTrip(input, ownerId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}

export function useUpdateTrip(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TripUpdate) => updateTrip(tripId, input),
    onSuccess: (updated) => {
      qc.setQueryData<Trip>(['trip', tripId], updated);
      qc.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}

export function useDeleteTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tripId: string) => deleteTrip(tripId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}
