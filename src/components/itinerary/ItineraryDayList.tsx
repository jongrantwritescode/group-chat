import { useMemo } from 'react';
import type { ItineraryItem } from '@/types/domain';
import { ItineraryItemCard } from './ItineraryItemCard';
import { formatDayHeader } from '@/lib/date';
import { EmptyState } from '@/components/ui/EmptyState';
import { CalendarDays } from 'lucide-react';

interface ItineraryDayListProps {
  items: ItineraryItem[];
  onEditItem?: (item: ItineraryItem) => void;
  onDeleteItem?: (item: ItineraryItem) => void;
}

export function ItineraryDayList({ items, onEditItem, onDeleteItem }: ItineraryDayListProps) {
  const grouped = useMemo(() => {
    const map = new Map<string, ItineraryItem[]>();
    for (const item of items) {
      const existing = map.get(item.day_date) ?? [];
      existing.push(item);
      map.set(item.day_date, existing);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [items]);

  if (grouped.length === 0) {
    return (
      <EmptyState
        icon={<CalendarDays size={32} />}
        title="No itinerary yet"
        description="Start planning your trip by adding events, activities, and reservations."
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 py-4">
      {grouped.map(([date, dayItems]) => (
        <div key={date}>
          <h3 className="text-sm font-semibold text-slate-500 mb-3 px-4">
            {formatDayHeader(date)}
          </h3>
          <div className="flex flex-col gap-3 px-4">
            {dayItems.map((item) => (
              <ItineraryItemCard
                key={item.id}
                item={item}
                onEdit={onEditItem}
                onDelete={onDeleteItem}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
