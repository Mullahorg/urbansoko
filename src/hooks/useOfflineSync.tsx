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

export interface CachedProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  images: string[] | null;
  colors: string[] | null;
  sizes: string[] | null;
  stock: number | null;
  featured: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  vendor_id: string | null;
  cachedImages?: string[]; // Base64 encoded images for offline use
}

const PENDING_ACTIONS_KEY = 'offline-pending-actions';
const OFFLINE_DATA_KEY = 'offline-cached-data';
const OFFLINE_PRODUCTS_KEY = 'offline-products-cache';
const OFFLINE_CATEGORIES_KEY = 'offline-categories-cache';
const OFFLINE_PRODUCT_DETAILS_KEY = 'offline-product-details-cache';
const OFFLINE_IMAGES_KEY = 'offline-images-cache';
const IMAGE_CACHE_NAME = 'product-images-v1';

// Helper to convert image URL to base64 for offline storage
const imageToBase64 = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url, { mode: 'cors' });
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

// Cache image using Cache API for better performance
const cacheImageWithCacheAPI = async (url: string): Promise<boolean> => {
  try {
    if ('caches' in window) {
      const cache = await caches.open(IMAGE_CACHE_NAME);
      await cache.add(url);
      return true;
    }
  } catch {
    // Fallback handled elsewhere
  }
  return false;
};

// Get cached image from Cache API
const getCachedImageFromCacheAPI = async (url: string): Promise<string | null> => {
  try {
    if ('caches' in window) {
      const cache = await caches.open(IMAGE_CACHE_NAME);
      const response = await cache.match(url);
      if (response) {
        const blob = await response.blob();
        return URL.createObjectURL(blob);
      }
    }
  } catch {
    // Fallback handled elsewhere
  }
  return null;
};

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [cacheProgress, setCacheProgress] = useState({ current: 0, total: 0 });
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

  // Cache a single image for offline use
  const cacheImage = useCallback(async (imageUrl: string): Promise<boolean> => {
    if (!imageUrl) return false;
    
    // Try Cache API first (more efficient)
    const cachedWithAPI = await cacheImageWithCacheAPI(imageUrl);
    if (cachedWithAPI) return true;
    
    // Fallback to base64 in localStorage
    const base64 = await imageToBase64(imageUrl);
    if (base64) {
      try {
        const cached = JSON.parse(localStorage.getItem(OFFLINE_IMAGES_KEY) || '{}');
        cached[imageUrl] = { data: base64, timestamp: Date.now() };
        localStorage.setItem(OFFLINE_IMAGES_KEY, JSON.stringify(cached));
        return true;
      } catch (e) {
        // Storage might be full
        console.warn('Failed to cache image in localStorage:', e);
      }
    }
    return false;
  }, []);

  // Get cached image URL (returns original if online, cached version if offline)
  const getCachedImage = useCallback(async (imageUrl: string): Promise<string> => {
    if (!imageUrl) return '';
    if (isOnline) return imageUrl;
    
    // Try Cache API first
    const cachedFromAPI = await getCachedImageFromCacheAPI(imageUrl);
    if (cachedFromAPI) return cachedFromAPI;
    
    // Fallback to localStorage base64
    try {
      const cached = JSON.parse(localStorage.getItem(OFFLINE_IMAGES_KEY) || '{}');
      if (cached[imageUrl]?.data) {
        return cached[imageUrl].data;
      }
    } catch {
      // Ignore
    }
    
    return imageUrl; // Return original as fallback
  }, [isOnline]);

  // Cache products for offline use with images
  const cacheProductsForOffline = useCallback(async (includeImages = true) => {
    if (!isOnline) return;
    
    try {
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (products) {
        // Store products data
        localStorage.setItem(OFFLINE_PRODUCTS_KEY, JSON.stringify({
          data: products,
          timestamp: Date.now()
        }));

        // Cache images in background
        if (includeImages) {
          const allImages: string[] = [];
          products.forEach(product => {
            if (product.image_url) allImages.push(product.image_url);
            if (product.images?.length) allImages.push(...product.images);
          });

          const uniqueImages = [...new Set(allImages)].filter(Boolean);
          setCacheProgress({ current: 0, total: uniqueImages.length });

          // Cache images in batches to avoid overwhelming
          const batchSize = 5;
          for (let i = 0; i < uniqueImages.length; i += batchSize) {
            const batch = uniqueImages.slice(i, i + batchSize);
            await Promise.all(batch.map(url => cacheImage(url)));
            setCacheProgress({ current: Math.min(i + batchSize, uniqueImages.length), total: uniqueImages.length });
          }
        }
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

      toast({
        title: "Offline Ready",
        description: `${products?.length || 0} products cached for offline browsing`,
      });
    } catch (error) {
      console.error('Failed to cache products for offline:', error);
    } finally {
      setCacheProgress({ current: 0, total: 0 });
    }
  }, [isOnline, cacheImage, toast]);

  // Cache a single product with full details and images
  const cacheProductDetail = useCallback(async (product: CachedProduct) => {
    if (!isOnline) return;
    
    try {
      const cached = JSON.parse(localStorage.getItem(OFFLINE_PRODUCT_DETAILS_KEY) || '{}');
      cached[product.id] = { data: product, timestamp: Date.now() };
      localStorage.setItem(OFFLINE_PRODUCT_DETAILS_KEY, JSON.stringify(cached));

      // Cache all product images
      const imagesToCache = [product.image_url, ...(product.images || [])].filter(Boolean);
      await Promise.all(imagesToCache.map(url => cacheImage(url as string)));
    } catch (e) {
      console.warn('Failed to cache product detail:', e);
    }
  }, [isOnline, cacheImage]);

  // Get cached product detail
  const getCachedProductDetail = useCallback((productId: string): CachedProduct | null => {
    try {
      const cached = JSON.parse(localStorage.getItem(OFFLINE_PRODUCT_DETAILS_KEY) || '{}');
      const productCache = cached[productId];
      if (productCache?.data) {
        // Cache valid for 7 days
        if (Date.now() - productCache.timestamp < 7 * 24 * 60 * 60 * 1000) {
          return productCache.data;
        }
      }
    } catch {
      // Ignore
    }
    return null;
  }, []);

  // Get cached products when offline
  const getOfflineProducts = useCallback((): CachedProduct[] | null => {
    const cached = localStorage.getItem(OFFLINE_PRODUCTS_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      // Cache valid for 7 days
      if (Date.now() - timestamp < 7 * 24 * 60 * 60 * 1000) {
        return data;
      }
    }
    return null;
  }, []);

  const getOfflineCategories = useCallback(() => {
    const cached = localStorage.getItem(OFFLINE_CATEGORIES_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < 7 * 24 * 60 * 60 * 1000) {
        return data;
      }
    }
    return null;
  }, []);

  // Preload related products for a category
  const preloadCategoryProducts = useCallback(async (category: string) => {
    if (!isOnline) return;
    
    try {
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .limit(20);
      
      if (products) {
        const cached = JSON.parse(localStorage.getItem(OFFLINE_PRODUCT_DETAILS_KEY) || '{}');
        products.forEach(product => {
          cached[product.id] = { data: product, timestamp: Date.now() };
        });
        localStorage.setItem(OFFLINE_PRODUCT_DETAILS_KEY, JSON.stringify(cached));
        
        // Cache images
        const allImages = products.flatMap(p => [p.image_url, ...(p.images || [])]).filter(Boolean);
        await Promise.all(allImages.slice(0, 20).map(url => cacheImage(url)));
      }
    } catch (e) {
      console.warn('Failed to preload category products:', e);
    }
  }, [isOnline, cacheImage]);

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
    cacheProgress,
    addPendingAction,
    syncPendingActions,
    cacheData,
    getCachedData,
    cacheProductsForOffline,
    getOfflineProducts,
    getOfflineCategories,
    cacheProductDetail,
    getCachedProductDetail,
    getCachedImage,
    cacheImage,
    preloadCategoryProducts,
    clearExpiredCache,
  };
};
