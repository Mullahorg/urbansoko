import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Skeleton } from "@/components/ui/skeleton";

interface RoleRouteProps {
  children: ReactNode;
  requiredRole?: "admin" | "vendor" | "user";
}

const RoleRoute = ({ children, requiredRole }: RoleRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isVendor, loading: roleLoading } = useUserRole();

  const loading = authLoading || roleLoading;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Skeleton className="h-12 w-12 rounded-full mx-auto" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  if (requiredRole === "admin" && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole === "vendor" && !isVendor && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default RoleRoute;
