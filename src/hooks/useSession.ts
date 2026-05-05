import { useSessionStore } from '@/stores/sessionStore';

export function useSession() {
  const { session, user, profile, loading } = useSessionStore();
  return { session, user, profile, loading, isAuthenticated: !!session };
}
