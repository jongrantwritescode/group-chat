import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { SupabaseSessionProvider } from '@/components/auth/SupabaseSessionProvider';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AuthRoute } from '@/routes/AuthRoute';
import { AuthCallbackRoute } from '@/routes/AuthCallbackRoute';
import { TripsListRoute } from '@/routes/TripsListRoute';
import { TripCreateRoute } from '@/routes/TripCreateRoute';
import { TripRoute } from '@/routes/TripRoute';
import { InviteAcceptRoute } from '@/routes/InviteAcceptRoute';
import { SettingsRoute } from '@/routes/SettingsRoute';
import { Toaster } from '@/components/ui/Toaster';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/*
       * BrowserRouter wraps SupabaseSessionProvider so that if the provider
       * ever needs to call useNavigate (e.g. on SIGNED_OUT events) it has
       * access to the router context.
       */}
      <BrowserRouter>
        <SupabaseSessionProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<AuthRoute />} />
            <Route path="/auth/callback" element={<AuthCallbackRoute />} />
            <Route path="/invite/:token" element={<InviteAcceptRoute />} />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <TripsListRoute />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trips/new"
              element={
                <ProtectedRoute>
                  <TripCreateRoute />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trips/:tripId"
              element={
                <ProtectedRoute>
                  <TripRoute />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsRoute />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster />
        </SupabaseSessionProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
