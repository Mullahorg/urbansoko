import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface RoleRouteProps {
  children: ReactNode;
  requiredRole?: "admin" | "vendor" | "user";
}

const RoleRoute = ({ children, requiredRole }: RoleRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/auth" replace />;

  if (requiredRole && user.role !== requiredRole) return <Navigate to="/" replace />;

  return <>{children}</>;
};

export default RoleRoute;
