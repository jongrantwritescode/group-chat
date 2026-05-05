import { supabase } from '@/lib/supabase';
import type { Trip, TripWithMembers } from '@/types/domain';
import type { Database } from '@/types/database';

type TripInsert = Database['public']['Tables']['trips']['Insert'];
type TripUpdate = Database['public']['Tables']['trips']['Update'];

export async function fetchTrips(): Promise<Trip[]> {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Trip[];
}

export async function fetchTrip(tripId: string): Promise<TripWithMembers> {
  const { data, error } = await supabase
    .from('trips')
    .select(
      `
      *,
      members:trip_members (
        role,
        rsvp,
        joined_at,
        user_id,
        trip_id,
        profile:profiles ( id, display_name, avatar_url, email )
      )
    `,
    )
    .eq('id', tripId)
    .single();

  if (error) throw error;
  return data as unknown as TripWithMembers;
}

export async function createTrip(
  input: Omit<TripInsert, 'owner_id'>,
  ownerId: string,
): Promise<Trip> {
  const { data, error } = await supabase
    .from('trips')
    .insert({ ...input, owner_id: ownerId })
    .select()
    .single();

  if (error) throw error;
  return data as Trip;
}

export async function updateTrip(tripId: string, input: TripUpdate): Promise<Trip> {
  const { data, error } = await supabase
    .from('trips')
    .update(input)
    .eq('id', tripId)
    .select()
    .single();

  if (error) throw error;
  return data as Trip;
}

export async function deleteTrip(tripId: string): Promise<void> {
  const { error } = await supabase.from('trips').delete().eq('id', tripId);
  if (error) throw error;
}

export async function uploadCover(tripId: string, file: Blob): Promise<string> {
  const path = `${tripId}/cover-${Date.now()}.jpg`;
  const { error: uploadError } = await supabase.storage
    .from('trip-covers')
    .upload(path, file, { upsert: true, contentType: 'image/jpeg' });

  if (uploadError) throw uploadError;

  const { error: updateError } = await supabase
    .from('trips')
    .update({ cover_image_path: path })
    .eq('id', tripId);

  if (updateError) throw updateError;
  return path;
}

export async function coverUrl(path: string): Promise<string | null> {
  const { data } = await supabase.storage
    .from('trip-covers')
    .createSignedUrl(path, 3600);

  return data?.signedUrl ?? null;
}
