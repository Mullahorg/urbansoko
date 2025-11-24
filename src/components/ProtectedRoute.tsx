import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Skeleton } from '@/components/ui/skeleton';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'vendor';
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isVendor, loading: roleLoading } = useUserRole();

  const loading = authLoading || roleLoading;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-20 w-full mb-4" />
        <Skeleton className="h-40 w-full mb-4" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (requiredRole) {
    if (requiredRole === 'admin' && !isAdmin) {
      return <Navigate to="/" replace />;
    }

    if (requiredRole === 'vendor' && !isVendor) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
