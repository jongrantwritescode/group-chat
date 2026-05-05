import { supabase } from '@/lib/supabase';
import type { Expense, Settlement, TripBalance, ShareInput } from '@/types/domain';

export interface CreateExpenseInput {
  tripId: string;
  paidBy: string;
  amountCents: number;
  currency: string;
  category: string;
  description: string;
  occurredOn: string;
  splitMethod: string;
  shares: ShareInput[];
}

export interface UpdateExpenseInput {
  expenseId: string;
  amountCents: number;
  currency: string;
  category: string;
  description: string;
  occurredOn: string;
  splitMethod: string;
  shares: ShareInput[];
}

export async function fetchExpenses(tripId: string): Promise<Expense[]> {
  const { data, error } = await supabase
    .from('expenses')
    .select(
      `
      *,
      paid_by_profile:profiles!expenses_paid_by_fkey ( id, display_name, avatar_url ),
      shares:expense_shares (
        expense_id,
        user_id,
        share_cents,
        profile:profiles ( id, display_name, avatar_url )
      )
    `,
    )
    .eq('trip_id', tripId)
    .order('occurred_on', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as unknown as Expense[];
}

export async function createExpense(input: CreateExpenseInput): Promise<string> {
  const { data, error } = await supabase.rpc('create_expense', {
    _trip_id: input.tripId,
    _paid_by: input.paidBy,
    _amount_cents: input.amountCents,
    _currency: input.currency,
    _category: input.category,
    _description: input.description,
    _occurred_on: input.occurredOn,
    _split_method: input.splitMethod,
    _shares: JSON.stringify(input.shares),
  });

  if (error) throw error;
  return data as string;
}

/**
 * Atomically update an expense and its shares via the update_expense RPC.
 * Using an RPC ensures shares are deleted and re-inserted in the same transaction,
 * preventing stale shares from causing incorrect balance calculations.
 */
export async function updateExpense(input: UpdateExpenseInput): Promise<void> {
  const { error } = await supabase.rpc('update_expense', {
    _expense_id: input.expenseId,
    _amount_cents: input.amountCents,
    _currency: input.currency,
    _category: input.category,
    _description: input.description,
    _occurred_on: input.occurredOn,
    _split_method: input.splitMethod,
    _shares: JSON.stringify(input.shares),
  });

  if (error) throw error;
}

export async function deleteExpense(expenseId: string): Promise<void> {
  const { error } = await supabase.from('expenses').delete().eq('id', expenseId);
  if (error) throw error;
}

export async function fetchBalances(tripId: string): Promise<TripBalance[]> {
  const { data, error } = await supabase
    .from('trip_balances')
    .select('*')
    .eq('trip_id', tripId);

  if (error) throw error;
  return data as TripBalance[];
}

export async function createSettlement(
  tripId: string,
  fromUser: string,
  toUser: string,
  amountCents: number,
  currency: string,
  note?: string,
): Promise<Settlement> {
  const { data, error } = await supabase
    .from('settlements')
    .insert({
      trip_id: tripId,
      from_user: fromUser,
      to_user: toUser,
      amount_cents: amountCents,
      currency,
      note: note ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Settlement;
}

export async function fetchSettlements(tripId: string): Promise<Settlement[]> {
  const { data, error } = await supabase
    .from('settlements')
    .select(
      `
      *,
      from_profile:profiles!settlements_from_user_fkey ( id, display_name, avatar_url ),
      to_profile:profiles!settlements_to_user_fkey ( id, display_name, avatar_url )
    `,
    )
    .eq('trip_id', tripId)
    .order('settled_on', { ascending: false });

  if (error) throw error;
  return data as unknown as Settlement[];
}
