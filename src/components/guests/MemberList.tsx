import type { TripMember } from '@/types/domain';
import { MemberRow } from './MemberRow';
import { EmptyState } from '@/components/ui/EmptyState';
import { Users } from 'lucide-react';
import type { RsvpStatus } from '@/types/domain';

interface MemberListProps {
  members: TripMember[];
  currentUserId: string;
  canManage: boolean;
  onUpdateRSVP?: (userId: string, rsvp: RsvpStatus) => void;
  onRemoveMember?: (userId: string) => void;
  rsvpLoadingId?: string | null;
}

export function MemberList({
  members,
  currentUserId,
  canManage,
  onUpdateRSVP,
  onRemoveMember,
  rsvpLoadingId,
}: MemberListProps) {
  if (members.length === 0) {
    return (
      <EmptyState
        icon={<Users size={32} />}
        title="No members yet"
        description="Invite people to join your trip."
      />
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 px-4">
      {members.map((member) => (
        <MemberRow
          key={member.user_id}
          member={member}
          isCurrentUser={member.user_id === currentUserId}
          canManage={canManage}
          onUpdateRSVP={
            onUpdateRSVP
              ? (rsvp) => onUpdateRSVP(member.user_id, rsvp)
              : undefined
          }
          onRemove={
            canManage && onRemoveMember && member.user_id !== currentUserId
              ? () => onRemoveMember(member.user_id)
              : undefined
          }
          rsvpLoading={rsvpLoadingId === member.user_id}
        />
      ))}
    </div>
  );
}
