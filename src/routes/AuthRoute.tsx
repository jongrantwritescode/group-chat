import { useState } from 'react';
import { signInWithProvider } from '@/lib/auth';
import { SSOButton } from '@/components/auth/SSOButton';
import { Map } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';

export function AuthRoute() {
  const { addToast } = useUIStore();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);

  async function handleSignIn(provider: 'google' | 'apple') {
    const setLoading = provider === 'google' ? setGoogleLoading : setAppleLoading;
    setLoading(true);
    try {
      await signInWithProvider(provider);
      // On web, the redirect happens automatically. On native, the deep link callback handles it.
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed. Please try again.';
      addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-6 py-12 pt-safe">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-600 shadow-lg">
          <Map size={32} className="text-white" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Group Trip Planner</h1>
          <p className="mt-1 text-slate-500">Plan unforgettable trips together</p>
        </div>
      </div>

      {/* Feature highlights */}
      <div className="mb-8 w-full max-w-sm rounded-2xl bg-slate-50 p-4">
        <ul className="space-y-2 text-sm text-slate-600">
          {[
            '📅 Shared itinerary planning',
            '💸 Fair expense tracking & splitting',
            '✅ Trip tasks & checklists',
            '👥 Guest management & RSVPs',
          ].map((feature) => (
            <li key={feature} className="flex items-center gap-2">
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Sign in buttons */}
      <div className="w-full max-w-sm flex flex-col gap-3">
        <SSOButton
          provider="google"
          onClick={() => handleSignIn('google')}
          loading={googleLoading}
        />
        <SSOButton
          provider="apple"
          onClick={() => handleSignIn('apple')}
          loading={appleLoading}
        />
      </div>

      <p className="mt-8 text-center text-xs text-slate-400">
        By signing in you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}
