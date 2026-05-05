import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { useTripMembers, useInviteMember, useUpdateRSVP, useRemoveMember } from '@/hooks/useTripMembers';
import { MemberList } from '@/components/guests/MemberList';
import { InviteSheet } from '@/components/guests/InviteSheet';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useUIStore } from '@/stores/uiStore';
import type { TripRole, RsvpStatus } from '@/types/domain';

interface GuestsTabProps {
  tripId: string;
  currentUserId: string;
  canManage: boolean;
}

export function GuestsTab({ tripId, currentUserId, canManage }: GuestsTabProps) {
  const { data: members, isLoading } = useTripMembers(tripId);
  const inviteMember = useInviteMember(tripId);
  const updateRSVP = useUpdateRSVP(tripId);
  const removeMember = useRemoveMember(tripId);
  const { addToast } = useUIStore();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [rsvpLoadingId, setRsvpLoadingId] = useState<string | null>(null);

  async function handleInvite(email: string, role: TripRole) {
    try {
      await inviteMember.mutateAsync({ email, role, invitedBy: currentUserId });
      addToast(`Invitation sent to ${email}`, 'success');
      setInviteOpen(false);
    } catch (err) {
      addToast('Failed to send invitation', 'error');
    }
  }

  async function handleUpdateRSVP(userId: string, rsvp: RsvpStatus) {
    setRsvpLoadingId(userId);
    try {
      await updateRSVP.mutateAsync({ userId, rsvp });
    } catch (err) {
      addToast('Failed to update RSVP', 'error');
    } finally {
      setRsvpLoadingId(null);
    }
  }

  async function handleRemoveMember(userId: string) {
    try {
      await removeMember.mutateAsync(userId);
      addToast('Member removed', 'success');
    } catch (err) {
      addToast('Failed to remove member', 'error');
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-4 px-4">
      {canManage && (
        <div className="flex justify-end">
          <Button size="sm" onClick={() => setInviteOpen(true)}>
            <UserPlus size={16} />
            Invite
          </Button>
        </div>
      )}

      <MemberList
        members={members ?? []}
        currentUserId={currentUserId}
        canManage={canManage}
        onUpdateRSVP={handleUpdateRSVP}
        onRemoveMember={canManage ? handleRemoveMember : undefined}
        rsvpLoadingId={rsvpLoadingId}
      />

      <InviteSheet
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onInvite={handleInvite}
        loading={inviteMember.isPending}
      />
    </div>
  );
}
