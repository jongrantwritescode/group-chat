import { supabase } from '@/lib/supabase';
import type { ItineraryItem, ItineraryCategory } from '@/types/domain';
import type { Database } from '@/types/database';

type ItineraryInsert = Database['public']['Tables']['itinerary_items']['Insert'];
type ItineraryUpdate = Database['public']['Tables']['itinerary_items']['Update'];

export async function fetchItinerary(tripId: string): Promise<ItineraryItem[]> {
  const { data, error } = await supabase
    .from('itinerary_items')
    .select('*')
    .eq('trip_id', tripId)
    .order('day_date', { ascending: true })
    .order('start_time', { ascending: true, nullsFirst: false });

  if (error) throw error;
  return data as ItineraryItem[];
}

export async function createItem(
  tripId: string,
  input: Omit<ItineraryInsert, 'trip_id' | 'created_by'>,
  createdBy: string,
): Promise<ItineraryItem> {
  const { data, error } = await supabase
    .from('itinerary_items')
    .insert({ ...input, trip_id: tripId, created_by: createdBy })
    .select()
    .single();

  if (error) throw error;
  return data as ItineraryItem;
}

export async function updateItem(
  itemId: string,
  input: ItineraryUpdate,
): Promise<ItineraryItem> {
  const { data, error } = await supabase
    .from('itinerary_items')
    .update(input)
    .eq('id', itemId)
    .select()
    .single();

  if (error) throw error;
  return data as ItineraryItem;
}

export async function deleteItem(itemId: string): Promise<void> {
  const { error } = await supabase.from('itinerary_items').delete().eq('id', itemId);
  if (error) throw error;
}

export type { ItineraryCategory };
