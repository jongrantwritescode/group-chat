import React from 'react';
import { BottomNav } from './BottomNav';

interface AppShellProps {
  children: React.ReactNode;
  hideBottomNav?: boolean;
}

export function AppShell({ children, hideBottomNav = false }: AppShellProps) {
  return (
    <div className="flex flex-col h-full">
      <main
        className="flex-1 overflow-y-auto"
        style={{ paddingBottom: hideBottomNav ? 0 : 'calc(64px + env(safe-area-inset-bottom))' }}
      >
        {children}
      </main>
      {!hideBottomNav && <BottomNav />}
    </div>
  );
}
