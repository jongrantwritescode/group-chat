import { useNavigate } from 'react-router-dom';
import { LogOut, User, ChevronRight } from 'lucide-react';
import { signOut } from '@/lib/auth';
import { useSession } from '@/hooks/useSession';
import { AppShell } from '@/components/layout/AppShell';
import { Header } from '@/components/layout/Header';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/stores/uiStore';

export function SettingsRoute() {
  const navigate = useNavigate();
  const { user, profile } = useSession();
  const { addToast } = useUIStore();

  const displayName = profile?.display_name ?? user?.email?.split('@')[0] ?? 'User';
  const avatarUrl = profile?.avatar_url;
  const email = user?.email;

  async function handleSignOut() {
    try {
      await signOut();
      navigate('/login', { replace: true });
    } catch (err) {
      addToast('Failed to sign out', 'error');
    }
  }

  return (
    <AppShell>
      <Header title="Settings" />

      <div className="px-4 py-6 flex flex-col gap-6">
        {/* Profile section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-4">
            <Avatar src={avatarUrl} name={displayName} size="xl" />
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-slate-900 text-lg">{displayName}</h2>
              {email && (
                <p className="text-sm text-slate-500 truncate">{email}</p>
              )}
            </div>
          </div>
        </div>

        {/* Menu items */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <button
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50 transition-colors border-b border-slate-100"
            onClick={() => { /* Profile edit - future */ }}
          >
            <User size={18} className="text-slate-400" />
            <span className="flex-1 text-sm font-medium text-slate-700">Edit Profile</span>
            <ChevronRight size={16} className="text-slate-300" />
          </button>
        </div>

        {/* App info */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">About</p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Version</span>
            <span className="text-slate-400">1.0.0</span>
          </div>
        </div>

        {/* Sign out */}
        <Button
          variant="danger"
          fullWidth
          onClick={handleSignOut}
        >
          <LogOut size={18} />
          Sign Out
        </Button>
      </div>
    </AppShell>
  );
}
