import React from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-700',
  primary: 'bg-primary-100 text-primary-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
};

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

// Convenience badge components
export function RoleBadge({ role }: { role: string }) {
  const variantMap: Record<string, BadgeVariant> = {
    owner: 'primary',
    admin: 'info',
    member: 'default',
  };
  return <Badge variant={variantMap[role] ?? 'default'}>{role}</Badge>;
}

export function RSVPBadge({ rsvp }: { rsvp: string }) {
  const variantMap: Record<string, BadgeVariant> = {
    going: 'success',
    maybe: 'warning',
    declined: 'danger',
    pending: 'default',
  };
  return <Badge variant={variantMap[rsvp] ?? 'default'}>{rsvp}</Badge>;
}
