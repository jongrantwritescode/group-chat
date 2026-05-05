import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchSettlements, createSettlement } from '@/api/expenses';

export function useSettlements(tripId: string) {
  return useQuery({
    queryKey: ['settlements', tripId],
    queryFn: () => fetchSettlements(tripId),
    enabled: !!tripId,
  });
}

export function useCreateSettlement(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      fromUser,
      toUser,
      amountCents,
      currency,
      note,
    }: {
      fromUser: string;
      toUser: string;
      amountCents: number;
      currency: string;
      note?: string;
    }) => createSettlement(tripId, fromUser, toUser, amountCents, currency, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settlements', tripId] });
      qc.invalidateQueries({ queryKey: ['balances', tripId] });
    },
  });
}
