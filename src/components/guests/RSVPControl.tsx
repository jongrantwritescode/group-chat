import type { RsvpStatus } from '@/types/domain';
import { cn } from '@/lib/utils';

const OPTIONS: { value: RsvpStatus; label: string }[] = [
  { value: 'going', label: '✓ Going' },
  { value: 'maybe', label: '? Maybe' },
  { value: 'declined', label: '✗ Can\'t Go' },
];

const activeClasses: Record<RsvpStatus, string> = {
  going: 'bg-green-600 text-white',
  maybe: 'bg-amber-500 text-white',
  declined: 'bg-red-600 text-white',
  pending: 'bg-slate-400 text-white',
};

interface RSVPControlProps {
  value: RsvpStatus;
  onChange: (rsvp: RsvpStatus) => void;
  disabled?: boolean;
}

export function RSVPControl({ value, onChange, disabled }: RSVPControlProps) {
  return (
    <div className="flex rounded-xl overflow-hidden border border-slate-200 divide-x divide-slate-200">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          disabled={disabled}
          className={cn(
            'flex-1 py-2 px-3 text-xs font-medium transition-colors min-h-[36px]',
            value === opt.value ? activeClasses[opt.value] : 'bg-white text-slate-600 hover:bg-slate-50',
            disabled && 'opacity-50 cursor-not-allowed',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
