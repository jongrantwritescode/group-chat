import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sheet } from '@/components/ui/Sheet';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import type { ItineraryItem, ItineraryCategory } from '@/types/domain';

const CATEGORY_OPTIONS: { value: ItineraryCategory; label: string }[] = [
  { value: 'travel', label: '✈️ Travel' },
  { value: 'lodging', label: '🏠 Lodging' },
  { value: 'food', label: '🍽 Food' },
  { value: 'activity', label: '⚡ Activity' },
  { value: 'meeting', label: '👥 Meeting' },
  { value: 'other', label: '📌 Other' },
];

const itemSchema = z
  .object({
    day_date: z.string().min(1, 'Date is required'),
    title: z.string().min(1, 'Title is required').max(120),
    category: z.enum(['travel', 'lodging', 'food', 'activity', 'meeting', 'other']),
    start_time: z.string().optional(),
    end_time: z.string().optional(),
    location: z.string().optional(),
    description: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.start_time && data.end_time) {
        return data.end_time >= data.start_time;
      }
      return true;
    },
    { message: 'End time must be after start time', path: ['end_time'] },
  );

// Exported so callers can type their handlers without casting
export type ItemFormValues = z.infer<typeof itemSchema>;

interface ItineraryItemFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ItemFormValues) => void;
  defaultValues?: Partial<ItemFormValues>;
  loading?: boolean;
  tripStartDate?: string;
  editingItem?: ItineraryItem;
}

export function ItineraryItemForm({
  open,
  onClose,
  onSubmit,
  defaultValues,
  loading,
  tripStartDate,
  editingItem,
}: ItineraryItemFormProps) {
  const buildValues = (): Partial<ItemFormValues> => ({
    category: 'activity',
    day_date: tripStartDate ?? '',
    ...defaultValues,
    ...(editingItem && {
      day_date: editingItem.day_date,
      title: editingItem.title,
      category: editingItem.category,
      start_time: editingItem.start_time ?? '',
      end_time: editingItem.end_time ?? '',
      location: editingItem.location ?? '',
      description: editingItem.description ?? '',
    }),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: buildValues(),
  });

  // Reset form whenever the editing item changes so re-used sheets show correct values
  useEffect(() => {
    reset(buildValues());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingItem?.id]);

  function handleClose() {
    reset();
    onClose();
  }

  return (
    <Sheet
      open={open}
      onClose={handleClose}
      title={editingItem ? 'Edit Item' : 'Add Itinerary Item'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Select
          label="Category"
          options={CATEGORY_OPTIONS}
          error={errors.category?.message}
          {...register('category')}
        />

        <Input
          label="Title *"
          placeholder="e.g., Check in at hotel"
          error={errors.title?.message}
          {...register('title')}
        />

        <Input
          label="Date *"
          type="date"
          error={errors.day_date?.message}
          {...register('day_date')}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Start Time"
            type="time"
            error={errors.start_time?.message}
            {...register('start_time')}
          />
          <Input
            label="End Time"
            type="time"
            error={errors.end_time?.message}
            {...register('end_time')}
          />
        </div>

        <Input
          label="Location"
          placeholder="e.g., Malibu Beach House"
          {...register('location')}
        />

        <Textarea
          label="Notes"
          placeholder="Additional details..."
          rows={3}
          {...register('description')}
        />

        <Button type="submit" loading={loading} fullWidth className="mt-2">
          {editingItem ? 'Save Changes' : 'Add to Itinerary'}
        </Button>
      </form>
    </Sheet>
  );
}
