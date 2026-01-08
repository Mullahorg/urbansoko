import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface GamificationSetting {
  id: string;
  feature: string;
  enabled: boolean;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface FlashSale {
  id: string;
  name: string;
  discount_percent: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
  product_ids: string[];
  created_at: string;
  updated_at: string;
}

// Default settings for all gamification features
const DEFAULT_GAMIFICATION_FEATURES: Omit<GamificationSetting, 'id' | 'created_at' | 'updated_at'>[] = [
  { feature: 'product_badges', enabled: true, settings: {} },
  { feature: 'floating_cart', enabled: true, settings: {} },
  { feature: 'scroll_to_top', enabled: true, settings: {} },
  { feature: 'confetti_animations', enabled: true, settings: {} },
  { feature: 'welcome_popup', enabled: true, settings: { delay: 3000 } },
  { feature: 'flash_sale_banner', enabled: true, settings: {} },
  { feature: 'social_proof_toast', enabled: true, settings: { interval: 30000 } },
];

export const useGamificationSettings = () => {
  return useQuery({
    queryKey: ['gamification-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gamification_settings')
        .select('*');
      
      if (error) {
        console.warn('Could not fetch gamification settings:', error.message);
        // Return defaults if fetch fails
        return DEFAULT_GAMIFICATION_FEATURES.map((f, i) => ({
          ...f,
          id: `default-${i}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })) as GamificationSetting[];
      }
      
      // If no data exists, return defaults with all features enabled
      if (!data || data.length === 0) {
        return DEFAULT_GAMIFICATION_FEATURES.map((f, i) => ({
          ...f,
          id: `default-${i}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })) as GamificationSetting[];
      }
      
      return data as GamificationSetting[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

export const useGamificationSetting = (feature: string) => {
  const { data: settings, isLoading } = useGamificationSettings();
  
  // Return default enabled state while loading or if setting not found
  if (isLoading) {
    const defaultFeature = DEFAULT_GAMIFICATION_FEATURES.find(f => f.feature === feature);
    return defaultFeature ? { ...defaultFeature, id: 'loading', created_at: '', updated_at: '' } as GamificationSetting : undefined;
  }
  
  const found = settings?.find(s => s.feature === feature);
  if (found) return found;
  
  // Return default if not found in database
  const defaultFeature = DEFAULT_GAMIFICATION_FEATURES.find(f => f.feature === feature);
  return defaultFeature ? { ...defaultFeature, id: 'default', created_at: '', updated_at: '' } as GamificationSetting : undefined;
};

export const useUpdateGamificationSetting = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ feature, enabled, settings }: { feature: string; enabled?: boolean; settings?: Record<string, any> }) => {
      const updateData: any = { updated_at: new Date().toISOString() };
      if (enabled !== undefined) updateData.enabled = enabled;
      if (settings !== undefined) updateData.settings = settings;

      // First try to update existing
      const { data: existingData, error: fetchError } = await supabase
        .from('gamification_settings')
        .select('id')
        .eq('feature', feature)
        .maybeSingle();
      
      if (existingData) {
        // Update existing
        const { data, error } = await supabase
          .from('gamification_settings')
          .update(updateData)
          .eq('feature', feature)
          .select()
          .maybeSingle();

        if (error) throw error;
        return data;
      } else {
        // Insert new setting
        const { data, error } = await supabase
          .from('gamification_settings')
          .insert({
            feature,
            enabled: enabled ?? true,
            settings: settings ?? {},
          })
          .select()
          .maybeSingle();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gamification-settings'] });
      toast({ title: 'Settings updated successfully' });
    },
    onError: (error: any) => {
      console.error('Failed to update gamification setting:', error);
      toast({ title: 'Failed to update settings', description: error.message, variant: 'destructive' });
    },
  });
};

export const useFlashSales = () => {
  return useQuery({
    queryKey: ['flash-sales'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('flash_sales')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as FlashSale[];
    },
  });
};

export const useActiveFlashSale = () => {
  return useQuery({
    queryKey: ['active-flash-sale'],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('flash_sales')
        .select('*')
        .eq('is_active', true)
        .lte('start_time', now)
        .gte('end_time', now)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data as FlashSale | null;
    },
    refetchInterval: 60000, // Refetch every minute
  });
};

export const useCreateFlashSale = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (sale: Omit<FlashSale, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('flash_sales')
        .insert(sale)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flash-sales'] });
      queryClient.invalidateQueries({ queryKey: ['active-flash-sale'] });
      toast({ title: 'Flash sale created successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to create flash sale', description: error.message, variant: 'destructive' });
    },
  });
};

export const useUpdateFlashSale = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<FlashSale> & { id: string }) => {
      const { data, error } = await supabase
        .from('flash_sales')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flash-sales'] });
      queryClient.invalidateQueries({ queryKey: ['active-flash-sale'] });
      toast({ title: 'Flash sale updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to update flash sale', description: error.message, variant: 'destructive' });
    },
  });
};

export const useDeleteFlashSale = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('flash_sales')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flash-sales'] });
      queryClient.invalidateQueries({ queryKey: ['active-flash-sale'] });
      toast({ title: 'Flash sale deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Failed to delete flash sale', description: error.message, variant: 'destructive' });
    },
  });
};
