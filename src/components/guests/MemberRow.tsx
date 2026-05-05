import { MoreVertical, LogOut, Shield } from 'lucide-react';
import type { TripMember } from '@/types/domain';
import { Avatar } from '@/components/ui/Avatar';
import { RoleBadge, RSVPBadge } from '@/components/ui/Badge';
import { RSVPControl } from './RSVPControl';
import type { RsvpStatus } from '@/types/domain';

interface MemberRowProps {
  member: TripMember;
  isCurrentUser: boolean;
  canManage: boolean;
  onUpdateRSVP?: (rsvp: RsvpStatus) => void;
  onRemove?: () => void;
  rsvpLoading?: boolean;
}

export function MemberRow({
  member,
  isCurrentUser,
  canManage,
  onUpdateRSVP,
  onRemove,
  rsvpLoading,
}: MemberRowProps) {
  const profile = member.profile;
  const displayName = profile?.display_name ?? 'Unknown';

  return (
    <div className="flex flex-col gap-3 py-3 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-3">
        <Avatar
          src={profile?.avatar_url}
          name={displayName}
          size="md"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-900 text-sm truncate">{displayName}</span>
            {isCurrentUser && (
              <span className="text-xs text-slate-400">(you)</span>
            )}
          </div>
          {profile?.email && (
            <p className="text-xs text-slate-500 truncate">{profile.email}</p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <RoleBadge role={member.role} />
          {canManage && !isCurrentUser && onRemove && (
            <button
              onClick={onRemove}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
              aria-label="Remove member"
            >
              <LogOut size={15} />
            </button>
          )}
        </div>
      </div>

      {/* RSVP control for current user */}
      {isCurrentUser && onUpdateRSVP && (
        <RSVPControl
          value={member.rsvp}
          onChange={onUpdateRSVP}
          disabled={rsvpLoading}
        />
      )}

      {/* RSVP badge for other members */}
      {!isCurrentUser && (
        <RSVPBadge rsvp={member.rsvp} />
      )}
    </div>
  );
}
