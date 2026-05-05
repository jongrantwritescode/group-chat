import { useState } from 'react';
import { Plus, CreditCard } from 'lucide-react';
import { useExpenses, useBalances, useCreateExpense } from '@/hooks/useExpenses';
import { useSettlements, useCreateSettlement } from '@/hooks/useSettlements';
import { useTripMembers } from '@/hooks/useTripMembers';
import { ExpenseList } from '@/components/expenses/ExpenseList';
import { ExpenseForm } from '@/components/expenses/ExpenseForm';
import { BalanceSummary } from '@/components/expenses/BalanceSummary';
import { SettlementSheet } from '@/components/expenses/SettlementSheet';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useUIStore } from '@/stores/uiStore';
import type { Database } from '@/types/database';

interface ExpensesTabProps {
  tripId: string;
  currentUserId: string;
  currency: string;
}

export function ExpensesTab({ tripId, currentUserId, currency }: ExpensesTabProps) {
  const { data: expenses, isLoading: expensesLoading } = useExpenses(tripId);
  const { data: balances } = useBalances(tripId);
  const { data: members } = useTripMembers(tripId);
  const createExpense = useCreateExpense(tripId);
  const createSettlement = useCreateSettlement(tripId);
  const { addToast } = useUIStore();

  const [expenseFormOpen, setExpenseFormOpen] = useState(false);
  const [settlementOpen, setSettlementOpen] = useState(false);

  async function handleCreateExpense(values: Parameters<typeof createExpense.mutateAsync>[0]) {
    try {
      await createExpense.mutateAsync(values);
      addToast('Expense added', 'success');
      setExpenseFormOpen(false);
    } catch (err) {
      addToast('Failed to add expense', 'error');
    }
  }

  async function handleCreateSettlement(
    fromUser: string,
    toUser: string,
    amountCents: number,
    note?: string,
  ) {
    try {
      await createSettlement.mutateAsync({ fromUser, toUser, amountCents, currency, note });
      addToast('Payment recorded', 'success');
      setSettlementOpen(false);
    } catch (err) {
      addToast('Failed to record payment', 'error');
    }
  }

  if (expensesLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Balance summary */}
      {balances && members && balances.length > 0 && (
        <div className="px-4 py-4 border-b border-slate-200">
          <BalanceSummary
            balances={balances}
            members={members}
            currency={currency}
            currentUserId={currentUserId}
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 px-4 py-3">
        <Button
          size="sm"
          onClick={() => setExpenseFormOpen(true)}
          className="flex-1"
        >
          <Plus size={16} />
          Add Expense
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setSettlementOpen(true)}
          className="flex-1"
        >
          <CreditCard size={16} />
          Record Payment
        </Button>
      </div>

      <ExpenseList
        expenses={expenses ?? []}
        currentUserId={currentUserId}
        currency={currency}
      />

      {members && (
        <>
          <ExpenseForm
            open={expenseFormOpen}
            onClose={() => setExpenseFormOpen(false)}
            onSubmit={(values) =>
              handleCreateExpense({
                tripId,
                paidBy: values.paidBy,
                amountCents: values.amountCents,
                currency,
                category: values.category as Database['public']['Enums']['expense_category'],
                description: values.description,
                occurredOn: values.occurredOn,
                splitMethod: values.splitMethod,
                shares: values.shares,
              })
            }
            members={members}
            currency={currency}
            currentUserId={currentUserId}
            loading={createExpense.isPending}
          />

          <SettlementSheet
            open={settlementOpen}
            onClose={() => setSettlementOpen(false)}
            onSubmit={handleCreateSettlement}
            members={members}
            currency={currency}
            currentUserId={currentUserId}
            loading={createSettlement.isPending}
          />
        </>
      )}
    </div>
  );
}
