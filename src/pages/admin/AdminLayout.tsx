import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield } from 'lucide-react';

const AdminLayout = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (authLoading) return;

      if (!user) {
        navigate('/auth', { replace: true });
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          navigate('/', { replace: true });
          return;
        }

        // user is admin, show layout
      } catch (err) {
        console.error('Admin check error:', err);
        navigate('/', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Skeleton className="h-12 w-12 rounded-full mx-auto" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b flex items-center px-4 gap-4 bg-background sticky top-0 z-10">
            <SidebarTrigger />
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold">Admin Panel</h1>
            </div>
          </header>
          <main className="flex-1 p-6">
            <Outlet /> {/* Nested admin pages render here */}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
