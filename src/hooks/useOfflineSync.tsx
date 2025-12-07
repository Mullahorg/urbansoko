import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WishlistData {
  product_id: string;
  user_id: string;
}

interface ReviewData {
  product_id: string;
  user_id: string;
  rating?: number;
  comment?: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  image?: string;
}

interface PendingAction {
  id: string;
  type: 'order' | 'wishlist' | 'review' | 'cart';
  action: 'create' | 'update' | 'delete' | 'sync';
  data: WishlistData | ReviewData | { id: string } | CartItem[];
  timestamp: number;
}

const PENDING_ACTIONS_KEY = 'offline-pending-actions';
const OFFLINE_DATA_KEY = 'offline-cached-data';
const OFFLINE_PRODUCTS_KEY = 'offline-products-cache';
const OFFLINE_CATEGORIES_KEY = 'offline-categories-cache';

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const { toast } = useToast();

  // Load pending actions from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(PENDING_ACTIONS_KEY);
    if (stored) {
      setPendingActions(JSON.parse(stored));
    }
    
    const lastSync = localStorage.getItem('last-sync-time');
    if (lastSync) {
      setLastSyncTime(new Date(lastSync));
    }
  }, []);

  // Save pending actions to localStorage
  useEffect(() => {
    localStorage.setItem(PENDING_ACTIONS_KEY, JSON.stringify(pendingActions));
  }, [pendingActions]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Back Online",
        description: "Syncing your changes...",
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "You're Offline",
        description: "Your changes will be saved and synced when you're back online.",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  // Sync pending actions when coming back online
  useEffect(() => {
    if (isOnline && pendingActions.length > 0) {
      syncPendingActions();
    }
  }, [isOnline]);

  // Cache products for offline use
  const cacheProductsForOffline = useCallback(async () => {
    if (!isOnline) return;
    
    try {
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .limit(50);
      
      if (products) {
        localStorage.setItem(OFFLINE_PRODUCTS_KEY, JSON.stringify({
          data: products,
          timestamp: Date.now()
        }));
      }

      const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true);
      
      if (categories) {
        localStorage.setItem(OFFLINE_CATEGORIES_KEY, JSON.stringify({
          data: categories,
          timestamp: Date.now()
        }));
      }
    } catch (error) {
      console.error('Failed to cache products for offline:', error);
    }
  }, [isOnline]);

  // Get cached products when offline
  const getOfflineProducts = useCallback(() => {
    const cached = localStorage.getItem(OFFLINE_PRODUCTS_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      // Cache valid for 24 hours
      if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
        return data;
      }
    }
    return null;
  }, []);

  const getOfflineCategories = useCallback(() => {
    const cached = localStorage.getItem(OFFLINE_CATEGORIES_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
        return data;
      }
    }
    return null;
  }, []);

  const addPendingAction = useCallback((action: Omit<PendingAction, 'id' | 'timestamp'>) => {
    const newAction: PendingAction = {
      ...action,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    setPendingActions(prev => [...prev, newAction]);
  }, []);

  const syncPendingActions = async () => {
    if (isSyncing || pendingActions.length === 0) return;

    setIsSyncing(true);
    const successfulIds: string[] = [];

    for (const action of pendingActions) {
      try {
        switch (action.type) {
          case 'wishlist':
            if (action.action === 'create') {
              const wishlistData = action.data as WishlistData;
              await supabase.from('wishlist').insert({
                product_id: wishlistData.product_id,
                user_id: wishlistData.user_id,
              });
            } else if (action.action === 'delete') {
              const deleteData = action.data as { id: string };
              await supabase.from('wishlist').delete().eq('id', deleteData.id);
            }
            break;
          case 'review':
            if (action.action === 'create') {
              const reviewData = action.data as ReviewData;
              await supabase.from('reviews').insert({
                product_id: reviewData.product_id,
                user_id: reviewData.user_id,
                rating: reviewData.rating,
                comment: reviewData.comment,
              });
            }
            break;
        }
        successfulIds.push(action.id);
      } catch (error) {
        console.error('Failed to sync action:', action, error);
      }
    }

    // Remove successful actions
    setPendingActions(prev => prev.filter(a => !successfulIds.includes(a.id)));
    setIsSyncing(false);
    
    // Update last sync time
    const now = new Date();
    setLastSyncTime(now);
    localStorage.setItem('last-sync-time', now.toISOString());

    if (successfulIds.length > 0) {
      toast({
        title: "Sync Complete",
        description: `${successfulIds.length} pending changes synced successfully.`,
      });
    }

    // Refresh offline cache after sync
    cacheProductsForOffline();
  };

  // Cache data for offline use
  const cacheData = useCallback((key: string, data: unknown) => {
    const cached = JSON.parse(localStorage.getItem(OFFLINE_DATA_KEY) || '{}');
    cached[key] = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(OFFLINE_DATA_KEY, JSON.stringify(cached));
  }, []);

  // Get cached data
  const getCachedData = useCallback(<T,>(key: string): T | null => {
    const cached = JSON.parse(localStorage.getItem(OFFLINE_DATA_KEY) || '{}');
    return cached[key]?.data || null;
  }, []);

  // Clear expired cache
  const clearExpiredCache = useCallback(() => {
    const cached = JSON.parse(localStorage.getItem(OFFLINE_DATA_KEY) || '{}');
    const now = Date.now();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

    Object.keys(cached).forEach(key => {
      if (now - cached[key].timestamp > maxAge) {
        delete cached[key];
      }
    });

    localStorage.setItem(OFFLINE_DATA_KEY, JSON.stringify(cached));
  }, []);

  // Initialize - cache products and clear expired cache
  useEffect(() => {
    if (isOnline) {
      cacheProductsForOffline();
      clearExpiredCache();
    }
  }, [isOnline, cacheProductsForOffline, clearExpiredCache]);

  return {
    isOnline,
    isSyncing,
    pendingActions,
    pendingCount: pendingActions.length,
    lastSyncTime,
    addPendingAction,
    syncPendingActions,
    cacheData,
    getCachedData,
    cacheProductsForOffline,
    getOfflineProducts,
    getOfflineCategories,
    clearExpiredCache,
  };
};
