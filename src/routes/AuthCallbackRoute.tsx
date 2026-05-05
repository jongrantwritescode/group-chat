import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { FullPageSpinner } from '@/components/ui/Spinner';

export function AuthCallbackRoute() {
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);

    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('Auth error:', error);
      navigate('/login');
      return;
    }

    function redirectAfterLogin() {
      // Consume any pending invite token saved before the OAuth redirect
      const pendingToken = sessionStorage.getItem('pendingInviteToken');
      if (pendingToken) {
        sessionStorage.removeItem('pendingInviteToken');
        navigate(`/invite/${pendingToken}`, { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }

    if (code) {
      supabase.auth
        .exchangeCodeForSession(code)
        .then(({ error }) => {
          if (error) {
            console.error('Session exchange error:', error);
            navigate('/login');
          } else {
            redirectAfterLogin();
          }
        });
      return;
    }

    // Fallback: check if already authenticated
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        redirectAfterLogin();
      } else {
        navigate('/login', { replace: true });
      }
    });
  }, [navigate]);

  return (
    <div className="flex min-h-full items-center justify-center">
      <div className="text-center">
        <FullPageSpinner />
        <p className="mt-4 text-sm text-slate-500">Completing sign in...</p>
      </div>
    </div>
  );
}
