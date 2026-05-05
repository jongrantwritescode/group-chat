import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  fetchBalances,
  type CreateExpenseInput,
  type UpdateExpenseInput,
} from '@/api/expenses';

export function useExpenses(tripId: string) {
  return useQuery({
    queryKey: ['expenses', tripId],
    queryFn: () => fetchExpenses(tripId),
    enabled: !!tripId,
  });
}

export function useBalances(tripId: string) {
  return useQuery({
    queryKey: ['balances', tripId],
    queryFn: () => fetchBalances(tripId),
    enabled: !!tripId,
  });
}

export function useCreateExpense(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateExpenseInput) => createExpense(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses', tripId] });
      qc.invalidateQueries({ queryKey: ['balances', tripId] });
    },
  });
}

export function useUpdateExpense(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateExpenseInput) => updateExpense(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses', tripId] });
      qc.invalidateQueries({ queryKey: ['balances', tripId] });
    },
  });
}

export function useDeleteExpense(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (expenseId: string) => deleteExpense(expenseId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses', tripId] });
      qc.invalidateQueries({ queryKey: ['balances', tripId] });
    },
  });
}
