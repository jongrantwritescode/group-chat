import type { TripBalance, TripMember } from '@/types/domain';
import { formatCents } from '@/lib/money';
import { Avatar } from '@/components/ui/Avatar';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BalanceSummaryProps {
  balances: TripBalance[];
  members: TripMember[];
  currency: string;
  currentUserId: string;
  compact?: boolean;
}

export function BalanceSummary({
  balances,
  members,
  currency,
  currentUserId,
  compact = false,
}: BalanceSummaryProps) {
  const memberMap = new Map(
    members.map((m) => [m.user_id, m.profile]),
  );

  // Sort: positive (owed money) first, then negative
  const sorted = [...balances].sort((a, b) => b.net_cents - a.net_cents);

  // Compute who owes whom (simplified debt algorithm)
  const debts = computeDebts(balances, members, currency);

  const myBalance = balances.find((b) => b.user_id === currentUserId);

  return (
    <div className="flex flex-col gap-3">
      {/* My balance summary */}
      {myBalance && (
        <div
          className={cn(
            'rounded-xl p-4 text-center',
            myBalance.net_cents > 0
              ? 'bg-green-50 border border-green-200'
              : myBalance.net_cents < 0
              ? 'bg-red-50 border border-red-200'
              : 'bg-slate-50 border border-slate-200',
          )}
        >
          <p className="text-xs text-slate-500 mb-1">Your balance</p>
          <p
            className={cn(
              'text-xl font-bold',
              myBalance.net_cents > 0
                ? 'text-green-700'
                : myBalance.net_cents < 0
                ? 'text-red-700'
                : 'text-slate-600',
            )}
          >
            {myBalance.net_cents > 0 ? '+' : ''}
            {formatCents(myBalance.net_cents, currency)}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {myBalance.net_cents > 0
              ? 'you are owed'
              : myBalance.net_cents < 0
              ? 'you owe'
              : 'all settled up'}
          </p>
        </div>
      )}

      {/* Debt summary */}
      {!compact && debts.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Who owes whom</p>
          {debts.map((debt, i) => {
            const from = memberMap.get(debt.fromUserId);
            const to = memberMap.get(debt.toUserId);
            if (!from || !to) return null;
            return (
              <div key={i} className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 p-3">
                <Avatar src={from.avatar_url} name={from.display_name} size="sm" />
                <span className="text-sm text-slate-700 truncate flex-shrink-0">{from.display_name}</span>
                <ArrowRight size={14} className="text-slate-400 flex-shrink-0 mx-1" />
                <Avatar src={to.avatar_url} name={to.display_name} size="sm" />
                <span className="text-sm text-slate-700 truncate flex-1 min-w-0">{to.display_name}</span>
                <span className="font-semibold text-slate-900 text-sm flex-shrink-0">
                  {formatCents(debt.amountCents, currency)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface Debt {
  fromUserId: string;
  toUserId: string;
  amountCents: number;
}

function computeDebts(
  balances: TripBalance[],
  members: TripMember[],
  _currency: string,
): Debt[] {
  // Simplified greedy algorithm
  const credits = balances
    .filter((b) => b.net_cents > 0)
    .map((b) => ({ userId: b.user_id, amount: b.net_cents }))
    .sort((a, b) => b.amount - a.amount);

  const debits = balances
    .filter((b) => b.net_cents < 0)
    .map((b) => ({ userId: b.user_id, amount: -b.net_cents }))
    .sort((a, b) => b.amount - a.amount);

  const debts: Debt[] = [];
  let i = 0;
  let j = 0;

  while (i < credits.length && j < debits.length) {
    const credit = credits[i];
    const debit = debits[j];
    const amount = Math.min(credit.amount, debit.amount);

    if (amount > 0) {
      debts.push({
        fromUserId: debit.userId,
        toUserId: credit.userId,
        amountCents: amount,
      });
    }

    credit.amount -= amount;
    debit.amount -= amount;

    if (credit.amount <= 0) i++;
    if (debit.amount <= 0) j++;
  }

  return debts;
}
