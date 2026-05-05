import { supabase } from '@/lib/supabase';
import type { Trip, TripWithMembers } from '@/types/domain';
import type { Database } from '@/types/database';

type TripInsert = Database['public']['Tables']['trips']['Insert'];
type TripUpdate = Database['public']['Tables']['trips']['Update'];

/**
 * Fetch all trips the current user is a member of.
 * Member details are intentionally not fetched here (N+1 avoidance);
 * instead, member_count is embedded via a count aggregate so TripCard
 * can display the member count without a separate request.
 */
export async function fetchTrips(): Promise<(Trip & { member_count: number })[]> {
  const { data, error } = await supabase
    .from('trips')
    .select('*, trip_members(count)')
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Supabase returns count as [{ count: N }] — unwrap to a plain number
  return (data as unknown as Array<Trip & { trip_members: [{ count: number }] }>).map(
    (row) => ({
      ...row,
      member_count: row.trip_members?.[0]?.count ?? 0,
    }),
  );
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
  // Use the blob's actual MIME type so Storage metadata is correct (PNG, JPEG, HEIC, etc.)
  const contentType = file.type || 'image/jpeg';
  const ext = contentType.split('/')[1]?.replace('jpeg', 'jpg') ?? 'jpg';
  const path = `${tripId}/cover-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('trip-covers')
    .upload(path, file, { upsert: true, contentType });

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
