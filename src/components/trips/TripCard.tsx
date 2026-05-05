import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Users, Globe2, ChevronRight } from 'lucide-react';
import type { Trip, TripMember } from '@/types/domain';
import { formatDateRange } from '@/lib/date';
import { coverUrl } from '@/api/trips';
import { RoleBadge } from '@/components/ui/Badge';

interface TripCardProps {
  trip: Trip;
  members?: TripMember[];
  /** Pre-computed member count from the list query — avoids N+1 member fetches */
  memberCount?: number;
  currentUserId?: string;
}

export function TripCard({ trip, members = [], memberCount, currentUserId }: TripCardProps) {
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const currentMember = members.find((m) => m.user_id === currentUserId);
  const displayCount = memberCount ?? members.length;

  useEffect(() => {
    if (trip.cover_image_path) {
      coverUrl(trip.cover_image_path)
        .then((url) => setImageUrl(url))
        .catch(() => setImageUrl(null));
    }
  }, [trip.cover_image_path]);

  const dateRange = formatDateRange(trip.start_date, trip.end_date);

  return (
    <button
      onClick={() => navigate(`/trips/${trip.id}`)}
      className="w-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden text-left active:scale-[0.98] transition-transform"
    >
      {/* Cover image */}
      <div className="relative h-36 bg-gradient-to-br from-primary-400 to-primary-700 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={trip.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Globe2 size={40} className="text-white/40" />
          </div>
        )}
        {currentMember && (
          <div className="absolute top-3 right-3">
            <RoleBadge role={currentMember.role} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-slate-900 truncate text-base">{trip.title}</h2>
            {trip.destination && (
              <p className="text-sm text-slate-500 mt-0.5 truncate">{trip.destination}</p>
            )}
          </div>
          <ChevronRight size={18} className="text-slate-400 flex-shrink-0 mt-0.5" />
        </div>

        <div className="mt-3 flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-sm text-slate-500">
            <CalendarDays size={15} />
            <span>{dateRange}</span>
          </div>
          {displayCount > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-slate-500">
              <Users size={15} />
              <span>{displayCount} {displayCount === 1 ? 'member' : 'members'}</span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
