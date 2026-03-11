import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'vendor' | 'user' | null;

export const useUserRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVendor, setIsVendor] = useState(false);

  useEffect(() => {
    const fetchRole = async () => {
      if (!user) {
        setRole(null);
        setIsAdmin(false);
        setIsVendor(false);
        setLoading(false);
        return;
      }

      try {
        // ONLY source of truth: user_roles table
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (roleData?.some(r => r.role === 'admin')) {
          setRole('admin');
          setIsAdmin(true);
          setIsVendor(false);
        } else if (roleData?.some(r => r.role === 'vendor')) {
          setRole('vendor');
          setIsAdmin(false);
          setIsVendor(true);
        } else {
          setRole('user');
          setIsAdmin(false);
          setIsVendor(false);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setRole('user');
        setIsAdmin(false);
        setIsVendor(false);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [user]);

  return { role, loading, isAdmin, isVendor };
};
