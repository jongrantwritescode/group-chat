import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useItinerary, useCreateItineraryItem, useUpdateItineraryItem, useDeleteItineraryItem } from '@/hooks/useItinerary';
import { ItineraryDayList } from '@/components/itinerary/ItineraryDayList';
import { ItineraryItemForm } from '@/components/itinerary/ItineraryItemForm';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useUIStore } from '@/stores/uiStore';
import type { ItineraryItem } from '@/types/domain';

interface ItineraryTabProps {
  tripId: string;
  currentUserId: string;
  tripStartDate?: string;
}

export function ItineraryTab({ tripId, currentUserId, tripStartDate }: ItineraryTabProps) {
  const { data: items, isLoading } = useItinerary(tripId);
  const createItem = useCreateItineraryItem(tripId);
  const updateItem = useUpdateItineraryItem(tripId);
  const deleteItem = useDeleteItineraryItem(tripId);
  const { addToast } = useUIStore();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItineraryItem | undefined>();

  async function handleSubmit(values: Parameters<typeof createItem.mutateAsync>[0]['input'] & { day_date: string; title: string; category: 'travel' | 'lodging' | 'food' | 'activity' | 'meeting' | 'other' }) {
    try {
      if (editingItem) {
        await updateItem.mutateAsync({ itemId: editingItem.id, input: values });
        addToast('Item updated', 'success');
      } else {
        await createItem.mutateAsync({ input: values, createdBy: currentUserId });
        addToast('Item added', 'success');
      }
      setSheetOpen(false);
      setEditingItem(undefined);
    } catch (err) {
      addToast('Failed to save item', 'error');
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
    <div>
      <div className="flex justify-end px-4 py-2">
        <Button
          size="sm"
          onClick={() => {
            setEditingItem(undefined);
            setSheetOpen(true);
          }}
        >
          <Plus size={16} />
          Add Event
        </Button>
      </div>

      <ItineraryDayList
        items={items ?? []}
        onEditItem={(item) => {
          setEditingItem(item);
          setSheetOpen(true);
        }}
      />

      <ItineraryItemForm
        open={sheetOpen}
        onClose={() => {
          setSheetOpen(false);
          setEditingItem(undefined);
        }}
        onSubmit={handleSubmit as any}
        loading={createItem.isPending || updateItem.isPending}
        editingItem={editingItem}
        tripStartDate={tripStartDate}
      />
    </div>
  );
}
