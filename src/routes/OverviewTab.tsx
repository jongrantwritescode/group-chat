import { Globe2, CalendarDays, Users, MapPin, Pencil } from 'lucide-react';
import type { TripWithMembers } from '@/types/domain';
import { formatDateRange } from '@/lib/date';
import { Avatar } from '@/components/ui/Avatar';
import { RoleBadge } from '@/components/ui/Badge';

interface OverviewTabProps {
  trip: TripWithMembers;
  currentUserId: string;
}

export function OverviewTab({ trip, currentUserId }: OverviewTabProps) {
  const dateRange = formatDateRange(trip.start_date, trip.end_date);
  const currentMember = trip.members?.find((m) => m.user_id === currentUserId);
  const memberCount = trip.members?.length ?? 0;

  return (
    <div className="flex flex-col gap-4 py-4 px-4">
      {/* Trip info card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-900">{trip.title}</h2>
            {trip.destination && (
              <div className="flex items-center gap-1 mt-1 text-slate-500">
                <MapPin size={14} />
                <span className="text-sm">{trip.destination}</span>
              </div>
            )}
          </div>
          {currentMember && <RoleBadge role={currentMember.role} />}
        </div>

        {trip.description && (
          <p className="text-sm text-slate-600 mb-4">{trip.description}</p>
        )}

        <div className="flex items-center gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-1.5">
            <CalendarDays size={15} />
            <span>{dateRange}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users size={15} />
            <span>{memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Globe2 size={15} />
            <span>{trip.currency}</span>
          </div>
        </div>
      </div>

      {/* Members preview */}
      {trip.members && trip.members.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Members</h3>
          <div className="flex flex-col gap-2">
            {trip.members.slice(0, 5).map((member) => (
              <div key={member.user_id} className="flex items-center gap-3">
                <Avatar
                  src={member.profile?.avatar_url}
                  name={member.profile?.display_name ?? 'Unknown'}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {member.profile?.display_name ?? 'Unknown'}
                    {member.user_id === currentUserId && (
                      <span className="text-slate-400 font-normal"> (you)</span>
                    )}
                  </p>
                </div>
                <RoleBadge role={member.role} />
              </div>
            ))}
            {trip.members.length > 5 && (
              <p className="text-xs text-slate-500 mt-1">
                +{trip.members.length - 5} more
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
