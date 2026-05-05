import { useState, useEffect, useMemo } from 'react';
import type { TripMember, SplitMethod, ShareInput } from '@/types/domain';
import { formatCents, splitEqually } from '@/lib/money';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input';

type SplitMode = 'equal' | 'exact' | 'percentage';

interface SplitEditorProps {
  totalCents: number;
  currency: string;
  members: TripMember[];
  value: ShareInput[];
  onChange: (shares: ShareInput[], method: SplitMethod) => void;
}

export function SplitEditor({ totalCents, currency, members, value, onChange }: SplitEditorProps) {
  const [mode, setMode] = useState<SplitMode>('equal');
  const [selectedIds, setSelectedIds] = useState<string[]>(
    members.map((m) => m.user_id),
  );
  const [exactValues, setExactValues] = useState<Record<string, string>>({});
  const [percentValues, setPercentValues] = useState<Record<string, string>>({});

  // Recompute shares whenever inputs change
  useEffect(() => {
    if (totalCents <= 0 || selectedIds.length === 0) return;

    let shares: ShareInput[] = [];

    if (mode === 'equal') {
      const amounts = splitEqually(totalCents, selectedIds.length);
      shares = selectedIds.map((id, i) => ({ user_id: id, share_cents: amounts[i] }));
    } else if (mode === 'exact') {
      shares = selectedIds.map((id) => ({
        user_id: id,
        share_cents: Math.round(parseFloat(exactValues[id] ?? '0') * 100) || 0,
      }));
    } else if (mode === 'percentage') {
      const pcts = selectedIds.map((id) => parseFloat(percentValues[id] ?? '0') || 0);
      const total = pcts.reduce((a, b) => a + b, 0);
      if (Math.abs(total - 100) < 0.01) {
        shares = selectedIds.map((id, i) => ({
          user_id: id,
          share_cents: Math.round((totalCents * pcts[i]) / 100),
        }));
        // Fix rounding
        const shareSum = shares.reduce((a, b) => a + b.share_cents, 0);
        if (shareSum !== totalCents && shares.length > 0) {
          shares[0].share_cents += totalCents - shareSum;
        }
      } else {
        shares = selectedIds.map((id) => ({ user_id: id, share_cents: 0 }));
      }
    }

    const method: SplitMethod = mode === 'equal' ? 'equal' : mode === 'exact' ? 'exact' : 'percentage';
    onChange(shares, method);
  }, [mode, selectedIds, exactValues, percentValues, totalCents]);

  const toggleMember = (userId: string) => {
    setSelectedIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  };

  const tabs: { value: SplitMode; label: string }[] = [
    { value: 'equal', label: 'Equal' },
    { value: 'exact', label: 'Exact' },
    { value: 'percentage', label: '%' },
  ];

  const percentTotal = selectedIds.reduce(
    (sum, id) => sum + (parseFloat(percentValues[id] ?? '0') || 0),
    0,
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">Split among</span>
        {/* Mode tabs */}
        <div className="flex rounded-lg overflow-hidden border border-slate-200">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setMode(tab.value)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium transition-colors',
                mode === tab.value ? 'bg-primary-600 text-white' : 'bg-white text-slate-600',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {members.map((member) => {
          const profile = member.profile;
          const name = profile?.display_name ?? 'Unknown';
          const isSelected = selectedIds.includes(member.user_id);

          return (
            <div
              key={member.user_id}
              className={cn(
                'flex items-center gap-3 rounded-xl p-3 border transition-colors',
                isSelected ? 'border-primary-300 bg-primary-50' : 'border-slate-200 bg-white opacity-50',
              )}
            >
              <button
                type="button"
                onClick={() => toggleMember(member.user_id)}
                className="flex items-center gap-3 flex-1 min-w-0 text-left"
              >
                <Avatar src={profile?.avatar_url} name={name} size="sm" />
                <span className="text-sm font-medium text-slate-900 truncate">{name}</span>
              </button>

              {isSelected && (
                <div className="flex-shrink-0">
                  {mode === 'equal' && (
                    <span className="text-sm text-slate-600">
                      {formatCents(
                        Math.floor(totalCents / (selectedIds.length || 1)),
                        currency,
                      )}
                    </span>
                  )}
                  {mode === 'exact' && (
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={exactValues[member.user_id] ?? ''}
                      onChange={(e) =>
                        setExactValues((prev) => ({ ...prev, [member.user_id]: e.target.value }))
                      }
                      className="w-20 rounded-lg border border-slate-300 px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                  {mode === 'percentage' && (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        placeholder="0"
                        value={percentValues[member.user_id] ?? ''}
                        onChange={(e) =>
                          setPercentValues((prev) => ({ ...prev, [member.user_id]: e.target.value }))
                        }
                        className="w-16 rounded-lg border border-slate-300 px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="text-sm text-slate-500">%</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {mode === 'percentage' && (
        <div
          className={cn(
            'text-xs font-medium text-right',
            Math.abs(percentTotal - 100) < 0.01 ? 'text-green-600' : 'text-red-600',
          )}
        >
          Total: {percentTotal.toFixed(1)}% {Math.abs(percentTotal - 100) < 0.01 ? '✓' : '(must be 100%)'}
        </div>
      )}
    </div>
  );
}
