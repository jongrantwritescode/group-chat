import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchItinerary, createItem, updateItem, deleteItem } from '@/api/itinerary';
import type { Database } from '@/types/database';

type ItineraryInsert = Database['public']['Tables']['itinerary_items']['Insert'];
type ItineraryUpdate = Database['public']['Tables']['itinerary_items']['Update'];

export function useItinerary(tripId: string) {
  return useQuery({
    queryKey: ['itinerary', tripId],
    queryFn: () => fetchItinerary(tripId),
    enabled: !!tripId,
  });
}

export function useCreateItineraryItem(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      input,
      createdBy,
    }: {
      input: Omit<ItineraryInsert, 'trip_id' | 'created_by'>;
      createdBy: string;
    }) => createItem(tripId, input, createdBy),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['itinerary', tripId] });
    },
  });
}

export function useUpdateItineraryItem(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, input }: { itemId: string; input: ItineraryUpdate }) =>
      updateItem(itemId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['itinerary', tripId] });
    },
  });
}

export function useDeleteItineraryItem(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => deleteItem(itemId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['itinerary', tripId] });
    },
  });
}
