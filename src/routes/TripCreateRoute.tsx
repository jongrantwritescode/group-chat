import { useNavigate } from 'react-router-dom';
import { useCreateTrip } from '@/hooks/useTrips';
import { useSession } from '@/hooks/useSession';
import { AppShell } from '@/components/layout/AppShell';
import { Header } from '@/components/layout/Header';
import { TripForm, type TripFormValues } from '@/components/trips/TripForm';
import { useUIStore } from '@/stores/uiStore';

export function TripCreateRoute() {
  const navigate = useNavigate();
  const { user } = useSession();
  const { addToast } = useUIStore();
  const createTrip = useCreateTrip();

  async function handleSubmit(values: TripFormValues) {
    if (!user) return;

    try {
      const trip = await createTrip.mutateAsync({
        input: {
          title: values.title,
          destination: values.destination ?? null,
          description: values.description ?? null,
          start_date: values.start_date ?? null,
          end_date: values.end_date ?? null,
          currency: values.currency,
        },
        ownerId: user.id,
      });
      addToast('Trip created!', 'success');
      navigate(`/trips/${trip.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create trip';
      addToast(message, 'error');
    }
  }

  return (
    <AppShell hideBottomNav>
      <Header title="New Trip" showBack />
      <div className="px-4 py-4">
        <TripForm
          onSubmit={handleSubmit}
          loading={createTrip.isPending}
          submitLabel="Create Trip"
        />
      </div>
    </AppShell>
  );
}
