import { ReactNode, useEffect } from "react";
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
  const { isAdmin, isVendor, loading: roleLoading, role } = useUserRole();

  const loading = authLoading || roleLoading;

  useEffect(() => {
    if (user) {
      console.log('🎯 RoleRoute Debug:', {
        email: user.email,
        role,
        isAdmin,
        isVendor,
        requiredRole,
        app_metadata: user.app_metadata,
        user_metadata: user.user_metadata
      });
    }
  }, [user, role, isAdmin, isVendor, requiredRole]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Skeleton className="h-12 w-12 rounded-full mx-auto" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('🔐 No user, redirecting to /auth');
    return <Navigate to="/auth" replace />;
  }

  if (requiredRole === "admin" && !isAdmin) {
    console.log(`🔐 Admin access denied for ${user.email} (isAdmin: ${isAdmin})`);
    return <Navigate to="/" replace />;
  }

  if (requiredRole === "vendor" && !isVendor && !isAdmin) {
    console.log(`🔐 Vendor access denied for ${user.email} (isVendor: ${isVendor}, isAdmin: ${isAdmin})`);
    return <Navigate to="/" replace />;
  }

  console.log(`✅ Access granted for ${user.email} to ${requiredRole} route`);
  return <>{children}</>;
};

export default RoleRoute;
