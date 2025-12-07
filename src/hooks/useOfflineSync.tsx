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

interface PendingAction {
  id: string;
  type: 'order' | 'wishlist' | 'review';
  action: 'create' | 'update' | 'delete';
  data: WishlistData | ReviewData | { id: string };
  timestamp: number;
}

const PENDING_ACTIONS_KEY = 'offline-pending-actions';
const OFFLINE_DATA_KEY = 'offline-cached-data';

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  // Load pending actions from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(PENDING_ACTIONS_KEY);
    if (stored) {
      setPendingActions(JSON.parse(stored));
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

    if (successfulIds.length > 0) {
      toast({
        title: "Sync Complete",
        description: `${successfulIds.length} pending changes synced successfully.`,
      });
    }
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

  return {
    isOnline,
    isSyncing,
    pendingActions,
    pendingCount: pendingActions.length,
    addPendingAction,
    syncPendingActions,
    cacheData,
    getCachedData,
  };
};
