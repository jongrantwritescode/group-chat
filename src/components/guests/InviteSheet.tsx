import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check, Copy } from 'lucide-react';
import { Sheet } from '@/components/ui/Sheet';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import type { TripRole } from '@/types/domain';

const inviteSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  role: z.enum(['admin', 'member']),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

interface InviteSheetProps {
  open: boolean;
  onClose: () => void;
  /** Called with (email, role); returns the generated invite token */
  onInvite: (email: string, role: TripRole) => Promise<string>;
  loading?: boolean;
}

const ROLE_OPTIONS = [
  { value: 'member', label: 'Member — can view and contribute' },
  { value: 'admin', label: 'Admin — can edit and manage members' },
];

export function InviteSheet({ open, onClose, onInvite, loading }: InviteSheetProps) {
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { role: 'member' },
  });

  function handleClose() {
    reset();
    setInviteLink(null);
    setCopied(false);
    onClose();
  }

  async function onSubmit(values: InviteFormValues) {
    const token = await onInvite(values.email, values.role as TripRole);
    const link = `${window.location.origin}/invite/${token}`;
    setInviteLink(link);
  }

  async function handleCopy() {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select the text
    }
  }

  return (
    <Sheet open={open} onClose={handleClose} title="Invite Someone">
      {inviteLink ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-slate-600">
            Invitation created! Share this link with your guest — it expires in 14 days.
          </p>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <span className="flex-1 text-xs text-slate-700 break-all font-mono">{inviteLink}</span>
            <button
              onClick={handleCopy}
              className="flex-shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-200 transition-colors"
              aria-label="Copy link"
            >
              {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
            </button>
          </div>
          <Button variant="secondary" onClick={handleClose} fullWidth>
            Done
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Email Address *"
            type="email"
            placeholder="friend@example.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <Select
            label="Role"
            options={ROLE_OPTIONS}
            error={errors.role?.message}
            {...register('role')}
          />

          <p className="text-sm text-slate-500">
            They&apos;ll receive an invitation link valid for 14 days.
          </p>

          <Button type="submit" loading={loading} fullWidth>
            Send Invitation
          </Button>
        </form>
      )}
    </Sheet>
  );
}
