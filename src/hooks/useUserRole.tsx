import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'moderator' | 'user' | 'vendor' | null;

export const useUserRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        // Check if user has a role in user_roles table
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        if (roleData?.role) {
          setRole(roleData.role as UserRole);
          setLoading(false);
          return;
        }

        // Check if user is a vendor
        const { data: vendorData, error: vendorError } = await supabase
          .from('vendors')
          .select('status')
          .eq('user_id', user.id)
          .eq('status', 'approved')
          .maybeSingle();

        setRole(vendorData ? 'vendor' : 'user');
      } catch (error) {
        // Silently default to user role
        setRole('user');
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [user]);

  return { role, loading, isAdmin: role === 'admin', isVendor: role === 'vendor', isModerator: role === 'moderator' };
};
