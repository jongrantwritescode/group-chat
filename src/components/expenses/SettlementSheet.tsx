import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sheet } from '@/components/ui/Sheet';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import type { TripMember } from '@/types/domain';

const settlementSchema = z
  .object({
    from_user: z.string().min(1, 'Required'),
    to_user: z.string().min(1, 'Required'),
    amount: z.string().min(1, 'Amount is required').refine(
      (v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0,
      'Amount must be positive',
    ),
    note: z.string().optional(),
  })
  .refine((d) => d.from_user !== d.to_user, {
    message: 'Cannot record a payment to yourself',
    path: ['to_user'],
  });

type SettlementFormValues = z.infer<typeof settlementSchema>;

interface SettlementSheetProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (fromUser: string, toUser: string, amountCents: number, note?: string) => void;
  members: TripMember[];
  currency: string;
  currentUserId: string;
  loading?: boolean;
  defaultFromUser?: string;
  defaultToUser?: string;
  suggestedAmount?: number;
}

export function SettlementSheet({
  open,
  onClose,
  onSubmit,
  members,
  currency,
  currentUserId,
  loading,
  defaultFromUser,
  defaultToUser,
  suggestedAmount,
}: SettlementSheetProps) {
  const memberOptions = members.map((m) => ({
    value: m.user_id,
    label: m.profile?.display_name ?? m.user_id,
  }));

  const buildDefaults = () => ({
    from_user: defaultFromUser ?? currentUserId,
    to_user: defaultToUser ?? '',
    amount: suggestedAmount ? (suggestedAmount / 100).toFixed(2) : '',
    note: '',
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SettlementFormValues>({
    resolver: zodResolver(settlementSchema),
    defaultValues: buildDefaults(),
  });

  // Reset form when prop defaults change (e.g. sheet re-used with different debtor)
  useEffect(() => {
    reset(buildDefaults());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultFromUser, defaultToUser, suggestedAmount]);

  function handleClose() {
    reset(buildDefaults());
    onClose();
  }

  function handleFormSubmit(values: SettlementFormValues) {
    const amountCents = Math.round(parseFloat(values.amount) * 100);
    onSubmit(values.from_user, values.to_user, amountCents, values.note);
  }

  return (
    <Sheet open={open} onClose={handleClose} title="Record Payment">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
        <Select
          label="From"
          options={memberOptions}
          error={errors.from_user?.message}
          {...register('from_user')}
        />

        <Select
          label="To"
          options={memberOptions}
          placeholder="Select recipient..."
          error={errors.to_user?.message}
          {...register('to_user')}
        />

        <Input
          label={`Amount (${currency}) *`}
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          error={errors.amount?.message}
          {...register('amount')}
        />

        <Textarea
          label="Note (optional)"
          placeholder="e.g., Venmo transfer"
          rows={2}
          {...register('note')}
        />

        <Button type="submit" loading={loading} fullWidth>
          Record Payment
        </Button>
      </form>
    </Sheet>
  );
}
