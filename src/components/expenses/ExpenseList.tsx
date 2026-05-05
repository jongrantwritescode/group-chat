import { useMemo } from 'react';
import type { Expense } from '@/types/domain';
import { formatDate } from '@/lib/date';
import { formatCents } from '@/lib/money';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Receipt } from 'lucide-react';

interface ExpenseListProps {
  expenses: Expense[];
  currentUserId: string;
  currency: string;
  onEdit?: (expense: Expense) => void;
}

const CATEGORY_EMOJI: Record<string, string> = {
  lodging: '🏠',
  food: '🍽',
  transport: '🚗',
  activity: '⚡',
  shopping: '🛍',
  other: '💳',
};

export function ExpenseList({ expenses, currentUserId, currency, onEdit }: ExpenseListProps) {
  const grouped = useMemo(() => {
    const map = new Map<string, Expense[]>();
    for (const expense of expenses) {
      const existing = map.get(expense.occurred_on) ?? [];
      existing.push(expense);
      map.set(expense.occurred_on, existing);
    }
    return Array.from(map.entries()).sort(([a], [b]) => b.localeCompare(a));
  }, [expenses]);

  if (grouped.length === 0) {
    return (
      <EmptyState
        icon={<Receipt size={32} />}
        title="No expenses yet"
        description="Track shared costs and split them fairly among trip members."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-4">
      {grouped.map(([date, dayExpenses]) => (
        <div key={date}>
          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {formatDate(date)}
            </span>
            <span className="text-xs text-slate-400">
              {formatCents(
                dayExpenses.reduce((sum, e) => sum + e.amount_cents, 0),
                currency,
              )}
            </span>
          </div>
          <div className="flex flex-col gap-2 px-4">
            {dayExpenses.map((expense) => (
              <ExpenseRow
                key={expense.id}
                expense={expense}
                currentUserId={currentUserId}
                currency={currency}
                onEdit={onEdit}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

interface ExpenseRowProps {
  expense: Expense;
  currentUserId: string;
  currency: string;
  onEdit?: (expense: Expense) => void;
}

function ExpenseRow({ expense, currentUserId, currency, onEdit }: ExpenseRowProps) {
  const paidByMe = expense.paid_by === currentUserId;
  const paidByProfile = expense.paid_by_profile;
  const myShare = expense.shares?.find((s) => s.user_id === currentUserId);

  return (
    <button
      onClick={() => onEdit?.(expense)}
      className="w-full bg-white rounded-xl border border-slate-200 p-3 text-left hover:border-primary-300 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="text-2xl flex-shrink-0">{CATEGORY_EMOJI[expense.category] ?? '💳'}</div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-900 text-sm truncate">{expense.description}</p>
          <div className="flex items-center gap-2 mt-0.5">
            {paidByProfile && (
              <span className="text-xs text-slate-500">
                {paidByMe ? 'You paid' : `${paidByProfile.display_name} paid`}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end flex-shrink-0">
          <span className="font-semibold text-slate-900 text-sm">
            {formatCents(expense.amount_cents, currency)}
          </span>
          {myShare && (
            <span className="text-xs text-slate-500">
              your share: {formatCents(myShare.share_cents, currency)}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
