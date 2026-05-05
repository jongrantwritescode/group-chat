import { Clock, MapPin, Plane, Home, Utensils, Zap, Users, MoreHorizontal } from 'lucide-react';
import type { ItineraryItem, ItineraryCategory } from '@/types/domain';
import { formatTime } from '@/lib/date';
import { cn } from '@/lib/utils';

interface ItineraryItemCardProps {
  item: ItineraryItem;
  onEdit?: (item: ItineraryItem) => void;
  onDelete?: (item: ItineraryItem) => void;
}

const categoryIcons: Record<ItineraryCategory, React.ReactNode> = {
  travel: <Plane size={16} />,
  lodging: <Home size={16} />,
  food: <Utensils size={16} />,
  activity: <Zap size={16} />,
  meeting: <Users size={16} />,
  other: <MoreHorizontal size={16} />,
};

const categoryColors: Record<ItineraryCategory, string> = {
  travel: 'bg-blue-100 text-blue-600',
  lodging: 'bg-purple-100 text-purple-600',
  food: 'bg-orange-100 text-orange-600',
  activity: 'bg-green-100 text-green-600',
  meeting: 'bg-pink-100 text-pink-600',
  other: 'bg-slate-100 text-slate-500',
};

export function ItineraryItemCard({ item, onEdit, onDelete }: ItineraryItemCardProps) {
  const startTime = formatTime(item.start_time);
  const endTime = formatTime(item.end_time);

  return (
    <div className="flex gap-3">
      {/* Time column */}
      <div className="w-16 flex-shrink-0 pt-1">
        {startTime && (
          <div className="flex flex-col items-end">
            <span className="text-xs font-medium text-slate-500">{startTime}</span>
            {endTime && (
              <span className="text-xs text-slate-400 mt-0.5">{endTime}</span>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            {/* Category icon */}
            <div
              className={cn(
                'flex-shrink-0 h-7 w-7 rounded-lg flex items-center justify-center',
                categoryColors[item.category],
              )}
            >
              {categoryIcons[item.category]}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 text-sm">{item.title}</p>
              {item.location && (
                <div className="flex items-center gap-1 mt-1">
                  <MapPin size={12} className="text-slate-400 flex-shrink-0" />
                  <span className="text-xs text-slate-500 truncate">{item.location}</span>
                </div>
              )}
              {item.description && (
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>
              )}
            </div>
          </div>

          {(onEdit || onDelete) && (
            <div className="flex gap-1 flex-shrink-0">
              {onEdit && (
                <button
                  onClick={() => onEdit(item)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                  aria-label="Edit"
                >
                  <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
                    <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/>
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
