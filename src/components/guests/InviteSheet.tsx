import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
  onInvite: (email: string, role: TripRole) => void;
  loading?: boolean;
}

const ROLE_OPTIONS = [
  { value: 'member', label: 'Member — can view and contribute' },
  { value: 'admin', label: 'Admin — can edit and manage members' },
];

export function InviteSheet({ open, onClose, onInvite, loading }: InviteSheetProps) {
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
    onClose();
  }

  function onSubmit(values: InviteFormValues) {
    onInvite(values.email, values.role as TripRole);
  }

  return (
    <Sheet open={open} onClose={handleClose} title="Invite Someone">
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
          They'll receive an invitation link valid for 14 days.
        </p>

        <Button type="submit" loading={loading} fullWidth>
          Send Invitation
        </Button>
      </form>
    </Sheet>
  );
}
