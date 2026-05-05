import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import type { Trip } from '@/types/domain';

const CURRENCIES = [
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'GBP', label: 'GBP — British Pound' },
  { value: 'JPY', label: 'JPY — Japanese Yen' },
  { value: 'CAD', label: 'CAD — Canadian Dollar' },
  { value: 'AUD', label: 'AUD — Australian Dollar' },
  { value: 'MXN', label: 'MXN — Mexican Peso' },
  { value: 'BRL', label: 'BRL — Brazilian Real' },
];

const tripSchema = z
  .object({
    title: z.string().min(1, 'Title is required').max(120, 'Title is too long'),
    destination: z.string().optional(),
    description: z.string().optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    currency: z.string().min(3).max(3),
  })
  .refine(
    (data) => {
      if (data.start_date && data.end_date) {
        return data.end_date >= data.start_date;
      }
      return true;
    },
    { message: 'End date must be after start date', path: ['end_date'] },
  );

export type TripFormValues = z.infer<typeof tripSchema>;

interface TripFormProps {
  defaultValues?: Partial<TripFormValues>;
  onSubmit: (values: TripFormValues) => void;
  loading?: boolean;
  submitLabel?: string;
}

export function TripForm({
  defaultValues,
  onSubmit,
  loading,
  submitLabel = 'Create Trip',
}: TripFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TripFormValues>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      currency: 'USD',
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input
        label="Trip Name *"
        placeholder="Summer Road Trip 2026"
        error={errors.title?.message}
        {...register('title')}
      />

      <Input
        label="Destination"
        placeholder="Pacific Coast Highway, CA"
        error={errors.destination?.message}
        {...register('destination')}
      />

      <Textarea
        label="Description"
        placeholder="Tell everyone what this trip is about..."
        rows={3}
        {...register('description')}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Start Date"
          type="date"
          error={errors.start_date?.message}
          {...register('start_date')}
        />
        <Input
          label="End Date"
          type="date"
          error={errors.end_date?.message}
          {...register('end_date')}
        />
      </div>

      <Select
        label="Currency"
        options={CURRENCIES}
        error={errors.currency?.message}
        {...register('currency')}
      />

      <Button type="submit" loading={loading} fullWidth className="mt-2">
        {submitLabel}
      </Button>
    </form>
  );
}
