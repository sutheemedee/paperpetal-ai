import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/auth/AuthProvider';

const Splash = () => (
  <div className="flex min-h-[100dvh] items-center justify-center bg-background">
    <Loader2 className="h-6 w-6 animate-spin text-primary" />
  </div>
);

export const ProtectedRoute = ({ children, adminOnly }: { children: React.ReactNode; adminOnly?: boolean }) => {
  const { session, loading, isAdmin, profile } = useAuth();
  const location = useLocation();

  if (loading && !session) return <Splash />;
  if (!session) return <Navigate to={`/auth/sign-in?next=${encodeURIComponent(location.pathname)}`} replace />;
  if (loading) return <Splash />;
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;
  if (profile && !profile.onboarded && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;
