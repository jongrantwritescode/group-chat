import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAcceptInvite } from '@/hooks/useTripMembers';
import { useSession } from '@/hooks/useSession';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Map } from 'lucide-react';

export function InviteAcceptRoute() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useSession();
  const acceptInvite = useAcceptInvite();

  useEffect(() => {
    if (!isAuthenticated) {
      // Save token and redirect to login
      if (token) {
        sessionStorage.setItem('pendingInviteToken', token);
      }
      navigate('/login');
      return;
    }

    if (token) {
      acceptInvite.mutate(token, {
        onSuccess: (tripId) => {
          navigate(`/trips/${tripId}`, { replace: true });
        },
        onError: (err) => {
          console.error('Failed to accept invite:', err);
        },
      });
    }
  }, [token, isAuthenticated]);

  if (acceptInvite.isPending) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center px-6">
        <FullPageSpinner />
        <p className="mt-4 text-sm text-slate-500">Accepting invitation...</p>
      </div>
    );
  }

  if (acceptInvite.isError) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center px-6 text-center">
        <div className="mb-4 rounded-full bg-red-100 p-4">
          <Map size={32} className="text-red-500" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900">Invitation Invalid</h2>
        <p className="mt-2 text-sm text-slate-500">
          This invitation link has expired or is no longer valid.
        </p>
        <Button className="mt-6" onClick={() => navigate('/')}>
          Go to My Trips
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-full items-center justify-center">
      <FullPageSpinner />
    </div>
  );
}
