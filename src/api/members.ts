import { supabase } from '@/lib/supabase';
import type { TripMember, TripRole, RsvpStatus } from '@/types/domain';

export async function fetchMembers(tripId: string): Promise<TripMember[]> {
  const { data, error } = await supabase
    .from('trip_members')
    .select(
      `
      trip_id,
      user_id,
      role,
      rsvp,
      joined_at,
      profile:profiles ( id, display_name, avatar_url, email )
    `,
    )
    .eq('trip_id', tripId)
    .order('joined_at', { ascending: true });

  if (error) throw error;
  return data as unknown as TripMember[];
}

/**
 * Invite a user to a trip by email.
 * Returns the server-generated invite token so the UI can construct a shareable link.
 */
export async function inviteMember(
  tripId: string,
  email: string,
  role: TripRole,
  invitedBy: string,
): Promise<string> {
  const { data, error } = await supabase
    .from('trip_invites')
    .insert({
      trip_id: tripId,
      email,
      role,
      invited_by: invitedBy,
    })
    .select('token')
    .single();

  if (error) throw error;
  return data.token as string;
}

export async function updateMemberRole(
  tripId: string,
  userId: string,
  role: TripRole,
): Promise<void> {
  const { error } = await supabase
    .from('trip_members')
    .update({ role })
    .eq('trip_id', tripId)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function removeMember(tripId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('trip_members')
    .delete()
    .eq('trip_id', tripId)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function updateRSVP(
  tripId: string,
  userId: string,
  rsvp: RsvpStatus,
): Promise<void> {
  const { error } = await supabase
    .from('trip_members')
    .update({ rsvp })
    .eq('trip_id', tripId)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function acceptInvite(token: string): Promise<string> {
  const { data, error } = await supabase.rpc('accept_trip_invite', {
    _token: token,
  });

  if (error) throw error;
  return data as string;
}
