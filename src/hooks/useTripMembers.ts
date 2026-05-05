import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchMembers,
  inviteMember,
  updateMemberRole,
  removeMember,
  updateRSVP,
  acceptInvite,
} from '@/api/members';
import type { TripRole, RsvpStatus } from '@/types/domain';

export function useTripMembers(tripId: string) {
  return useQuery({
    queryKey: ['members', tripId],
    queryFn: () => fetchMembers(tripId),
    enabled: !!tripId,
  });
}

export function useInviteMember(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      email,
      role,
      invitedBy,
    }: {
      email: string;
      role: TripRole;
      invitedBy: string;
    }) => inviteMember(tripId, email, role, invitedBy),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['members', tripId] });
    },
  });
}

export function useUpdateMemberRole(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: TripRole }) =>
      updateMemberRole(tripId, userId, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['members', tripId] });
    },
  });
}

export function useRemoveMember(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => removeMember(tripId, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['members', tripId] });
      qc.invalidateQueries({ queryKey: ['trip', tripId] });
    },
  });
}

export function useUpdateRSVP(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, rsvp }: { userId: string; rsvp: RsvpStatus }) =>
      updateRSVP(tripId, userId, rsvp),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['members', tripId] });
    },
  });
}

export function useAcceptInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (token: string) => acceptInvite(token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}
