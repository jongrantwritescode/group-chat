import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Map } from 'lucide-react';
import { useTrips } from '@/hooks/useTrips';
import { useTripMembers } from '@/hooks/useTripMembers';
import { useSession } from '@/hooks/useSession';
import { AppShell } from '@/components/layout/AppShell';
import { Header } from '@/components/layout/Header';
import { TripCard } from '@/components/trips/TripCard';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';

export function TripsListRoute() {
  const navigate = useNavigate();
  const { user } = useSession();
  const { data: trips, isLoading, error } = useTrips();

  if (isLoading) {
    return (
      <AppShell>
        <Header title="My Trips" />
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <Header title="My Trips" />
        <div className="p-4">
          <p className="text-red-600 text-sm">Failed to load trips. Please try again.</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Header
        title="My Trips"
        action={
          <button
            onClick={() => navigate('/trips/new')}
            className="flex items-center justify-center h-9 w-9 rounded-full bg-primary-600 text-white hover:bg-primary-700 transition-colors"
            aria-label="Create new trip"
          >
            <Plus size={20} />
          </button>
        }
      />

      <div className="px-4 py-4">
        {!trips || trips.length === 0 ? (
          <EmptyState
            icon={<Map size={40} />}
            title="No trips yet"
            description="Create your first trip and start planning an unforgettable adventure with friends."
            action={
              <Button onClick={() => navigate('/trips/new')}>
                <Plus size={18} />
                Create a Trip
              </Button>
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {trips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                currentUserId={user?.id}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
