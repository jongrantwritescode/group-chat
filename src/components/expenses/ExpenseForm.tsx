import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { Sheet } from '@/components/ui/Sheet';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { SplitEditor } from './SplitEditor';
import type { TripMember, ShareInput, SplitMethod } from '@/types/domain';

const expenseSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  amount: z.string().min(1, 'Amount is required').refine(
    (v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0,
    'Amount must be positive',
  ),
  category: z.enum(['lodging', 'food', 'transport', 'activity', 'shopping', 'other']),
  occurred_on: z.string().min(1, 'Date is required'),
  paid_by: z.string().min(1, 'Payer is required'),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: {
    description: string;
    amountCents: number;
    category: string;
    occurredOn: string;
    paidBy: string;
    shares: ShareInput[];
    splitMethod: SplitMethod;
  }) => void;
  members: TripMember[];
  currency: string;
  currentUserId: string;
  loading?: boolean;
}

const CATEGORY_OPTIONS = [
  { value: 'food', label: '🍽 Food & Drink' },
  { value: 'lodging', label: '🏠 Lodging' },
  { value: 'transport', label: '🚗 Transport' },
  { value: 'activity', label: '⚡ Activities' },
  { value: 'shopping', label: '🛍 Shopping' },
  { value: 'other', label: '💳 Other' },
];

export function ExpenseForm({
  open,
  onClose,
  onSubmit,
  members,
  currency,
  currentUserId,
  loading,
}: ExpenseFormProps) {
  const [shares, setShares] = useState<ShareInput[]>([]);
  const [splitMethod, setSplitMethod] = useState<SplitMethod>('equal');

  const memberOptions = members.map((m) => ({
    value: m.user_id,
    label: m.profile?.display_name ?? m.user_id,
  }));

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      category: 'other',
      occurred_on: new Date().toISOString().split('T')[0],
      paid_by: currentUserId,
    },
  });

  const amountStr = watch('amount');
  const amountCents = Math.round(parseFloat(amountStr || '0') * 100) || 0;

  function handleClose() {
    reset();
    onClose();
  }

  function handleFormSubmit(values: ExpenseFormValues) {
    onSubmit({
      description: values.description,
      amountCents: Math.round(parseFloat(values.amount) * 100),
      category: values.category,
      occurredOn: values.occurred_on,
      paidBy: values.paid_by,
      shares,
      splitMethod,
    });
  }

  return (
    <Sheet open={open} onClose={handleClose} title="Add Expense">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
        <Input
          label="Description *"
          placeholder="e.g., Dinner at The Lobster"
          error={errors.description?.message}
          {...register('description')}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label={`Amount (${currency}) *`}
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            error={errors.amount?.message}
            {...register('amount')}
          />
          <Input
            label="Date *"
            type="date"
            error={errors.occurred_on?.message}
            {...register('occurred_on')}
          />
        </div>

        <Select
          label="Category"
          options={CATEGORY_OPTIONS}
          error={errors.category?.message}
          {...register('category')}
        />

        <Select
          label="Paid by"
          options={memberOptions}
          error={errors.paid_by?.message}
          {...register('paid_by')}
        />

        {/* Split editor */}
        <div className="border-t border-slate-200 pt-4">
          <SplitEditor
            totalCents={amountCents}
            currency={currency}
            members={members}
            onChange={(newShares, method) => {
              setShares(newShares);
              setSplitMethod(method);
            }}
          />
        </div>

        <Button type="submit" loading={loading} fullWidth className="mt-2">
          Add Expense
        </Button>
      </form>
    </Sheet>
  );
}
