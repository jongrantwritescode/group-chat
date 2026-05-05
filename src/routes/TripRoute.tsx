import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTripById } from '@/hooks/useTrips';
import { useRealtimeTrip } from '@/hooks/useRealtimeTrip';
import { useSession } from '@/hooks/useSession';
import { useActiveTripStore } from '@/stores/activeTripStore';
import { AppShell } from '@/components/layout/AppShell';
import { Header } from '@/components/layout/Header';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { OverviewTab } from './OverviewTab';
import { ItineraryTab } from './ItineraryTab';
import { GuestsTab } from './GuestsTab';
import { ExpensesTab } from './ExpensesTab';
import { TasksTab } from './TasksTab';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

type Tab = 'overview' | 'itinerary' | 'guests' | 'expenses' | 'tasks';

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'itinerary', label: 'Itinerary' },
  { id: 'guests', label: 'Guests' },
  { id: 'expenses', label: 'Expenses' },
  { id: 'tasks', label: 'Tasks' },
];

export function TripRoute() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { user } = useSession();
  const { activeTab, setActiveTab, setActiveTripId } = useActiveTripStore();
  const [tab, setTab] = useState<Tab>('overview');

  const { data: trip, isLoading, error } = useTripById(tripId!);

  // Subscribe to realtime
  useRealtimeTrip(tripId!);

  useEffect(() => {
    if (tripId) setActiveTripId(tripId);
    return () => setActiveTripId(null);
  }, [tripId, setActiveTripId]);

  if (isLoading) return <FullPageSpinner />;

  if (error || !trip) {
    return (
      <AppShell hideBottomNav>
        <Header title="Trip" showBack />
        <div className="p-4 text-red-600 text-sm">
          Trip not found or you don&apos;t have access.
        </div>
      </AppShell>
    );
  }

  const currentMember = trip.members?.find((m) => m.user_id === user?.id);
  const canManage = currentMember?.role === 'owner' || currentMember?.role === 'admin';

  return (
    <AppShell hideBottomNav>
      <Header title={trip.title} showBack />

      {/* Tab bar */}
      <div className="bg-white border-b border-slate-200 sticky top-14 z-10">
        <div className="flex overflow-x-auto no-scrollbar">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                'flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                tab === id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1">
        {tab === 'overview' && (
          <OverviewTab trip={trip} currentUserId={user?.id ?? ''} />
        )}
        {tab === 'itinerary' && (
          <ItineraryTab
            tripId={tripId!}
            currentUserId={user?.id ?? ''}
            tripStartDate={trip.start_date ?? undefined}
          />
        )}
        {tab === 'guests' && (
          <GuestsTab
            tripId={tripId!}
            currentUserId={user?.id ?? ''}
            canManage={canManage}
          />
        )}
        {tab === 'expenses' && (
          <ExpensesTab
            tripId={tripId!}
            currentUserId={user?.id ?? ''}
            currency={trip.currency}
          />
        )}
        {tab === 'tasks' && (
          <TasksTab tripId={tripId!} currentUserId={user?.id ?? ''} />
        )}
      </div>
    </AppShell>
  );
}
