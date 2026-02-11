import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'moderator' | 'user' | 'vendor' | null;

export const useUserRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVendor, setIsVendor] = useState(false);
  const [isModerator, setIsModerator] = useState(false);

  useEffect(() => {
    const fetchRole = async () => {
      if (!user) {
        setRole(null);
        setIsAdmin(false);
        setIsVendor(false);
        setIsModerator(false);
        setLoading(false);
        return;
      }

      try {
        // ============ CHECK 1: Auth Metadata (FASTEST) ============
        // Check if user has admin claims in app_metadata or user_metadata
        const hasAdminClaim = 
          user?.app_metadata?.claims_admin === true ||
          user?.app_metadata?.role === 'admin' ||
          user?.app_metadata?.is_admin === true ||
          user?.user_metadata?.role === 'admin' ||
          user?.user_metadata?.is_admin === true ||
          user?.email === 'johnmulama001@gmail.com'; // Direct check for John
        
        if (hasAdminClaim) {
          console.log('👑 Admin detected from auth metadata!');
          setRole('admin');
          setIsAdmin(true);
          setIsVendor(false);
          setIsModerator(false);
          setLoading(false);
          return;
        }

        // ============ CHECK 2: user_roles table ============
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        if (roleData?.role) {
          const userRole = roleData.role as UserRole;
          setRole(userRole);
          setIsAdmin(userRole === 'admin');
          setIsVendor(userRole === 'vendor');
          setIsModerator(userRole === 'moderator');
          setLoading(false);
          return;
        }

        // ============ CHECK 3: vendors table ============
        const { data: vendorData, error: vendorError } = await supabase
          .from('vendors')
          .select('status')
          .eq('user_id', user.id)
          .eq('status', 'approved')
          .maybeSingle();

        if (vendorData) {
          setRole('vendor');
          setIsAdmin(false);
          setIsVendor(true);
          setIsModerator(false);
          setLoading(false);
          return;
        }

        // ============ CHECK 4: profiles table (backup) ============
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role, is_admin')
          .eq('id', user.id)
          .maybeSingle();

        if (profileData?.is_admin === true || profileData?.role === 'admin') {
          console.log('👑 Admin detected from profiles table!');
          setRole('admin');
          setIsAdmin(true);
          setIsVendor(false);
          setIsModerator(false);
          setLoading(false);
          return;
        }

        // ============ DEFAULT: regular user ============
        setRole('user');
        setIsAdmin(false);
        setIsVendor(false);
        setIsModerator(false);
        
      } catch (error) {
        console.error('Error fetching user role:', error);
        // Silently default to user role
        setRole('user');
        setIsAdmin(false);
        setIsVendor(false);
        setIsModerator(false);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [user]);

  return { 
    role, 
    loading, 
    isAdmin, 
    isVendor, 
    isModerator 
  };
};
