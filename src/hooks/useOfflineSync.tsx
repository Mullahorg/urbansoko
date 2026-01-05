import { useState, useEffect, useCallback, useRef } from 'react';
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
  retryCount: number;
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
  cachedImages?: string[];
}

// Storage keys with version for cache busting
const STORAGE_VERSION = 'v2';
const PENDING_ACTIONS_KEY = `offline-pending-actions-${STORAGE_VERSION}`;
const OFFLINE_DATA_KEY = `offline-cached-data-${STORAGE_VERSION}`;
const OFFLINE_PRODUCTS_KEY = `offline-products-cache-${STORAGE_VERSION}`;
const OFFLINE_CATEGORIES_KEY = `offline-categories-cache-${STORAGE_VERSION}`;
const OFFLINE_PRODUCT_DETAILS_KEY = `offline-product-details-cache-${STORAGE_VERSION}`;
const OFFLINE_IMAGES_KEY = `offline-images-cache-${STORAGE_VERSION}`;
const IMAGE_CACHE_NAME = 'product-images-v2';
const CACHE_VALIDITY = 14 * 24 * 60 * 60 * 1000; // 14 days
const MAX_RETRY_COUNT = 5;
const RETRY_DELAY_BASE = 1000; // Exponential backoff base

// Military-grade storage wrapper with fallbacks
const SafeStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch {
      console.warn(`[Storage] Failed to read ${key}`);
      return null;
    }
  },
  setItem: (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      console.warn(`[Storage] Failed to write ${key}:`, e);
      // Try to clear old data and retry
      try {
        SafeStorage.clearOldCaches();
        localStorage.setItem(key, value);
        return true;
      } catch {
        return false;
      }
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Silently fail
    }
  },
  clearOldCaches: (): void => {
    try {
      const keysToCheck = Object.keys(localStorage);
      keysToCheck.forEach(key => {
        if (key.includes('offline-') && !key.includes(STORAGE_VERSION)) {
          localStorage.removeItem(key);
        }
      });
    } catch {
      // Silently fail
    }
  }
};

// Helper to convert image URL to base64 for offline storage
const imageToBase64 = async (url: string, timeout = 10000): Promise<string | null> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, { 
      mode: 'cors',
      signal: controller.signal,
      cache: 'force-cache'
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) return null;
    
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
};

// Cache image using Cache API for better performance
const cacheImageWithCacheAPI = async (url: string): Promise<boolean> => {
  try {
    if ('caches' in window) {
      const cache = await caches.open(IMAGE_CACHE_NAME);
      const response = await fetch(url, { mode: 'cors', cache: 'force-cache' });
      if (response.ok) {
        await cache.put(url, response.clone());
        return true;
      }
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
  const [storageUsage, setStorageUsage] = useState<{ used: number; quota: number } | null>(null);
  const { toast } = useToast();
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);

  // Get storage usage estimate
  const updateStorageUsage = useCallback(async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        setStorageUsage({
          used: estimate.usage || 0,
          quota: estimate.quota || 0
        });
      } catch {
        // Not supported
      }
    }
  }, []);

  // Load pending actions from localStorage with validation
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;
    
    // Clear old version caches
    SafeStorage.clearOldCaches();
    
    const stored = SafeStorage.getItem(PENDING_ACTIONS_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Filter out corrupted or very old actions (> 7 days)
          const validActions = parsed.filter((a: PendingAction) => 
            a.id && a.type && a.action && a.timestamp && 
            Date.now() - a.timestamp < 7 * 24 * 60 * 60 * 1000
          );
          setPendingActions(validActions);
        }
      } catch {
        SafeStorage.removeItem(PENDING_ACTIONS_KEY);
      }
    }
    
    const lastSync = SafeStorage.getItem('last-sync-time');
    if (lastSync) {
      setLastSyncTime(new Date(lastSync));
    }
    
    updateStorageUsage();
  }, [updateStorageUsage]);

  // Save pending actions to localStorage with debounce
  useEffect(() => {
    if (!isInitializedRef.current) return;
    SafeStorage.setItem(PENDING_ACTIONS_KEY, JSON.stringify(pendingActions));
  }, [pendingActions]);

  // Listen for online/offline events with debounce
  useEffect(() => {
    let onlineTimeout: NodeJS.Timeout;
    
    const handleOnline = () => {
      clearTimeout(onlineTimeout);
      onlineTimeout = setTimeout(() => {
        setIsOnline(true);
        toast({
          title: "🌐 Back Online",
          description: "Syncing your changes...",
        });
      }, 500); // Debounce to avoid rapid state changes
    };

    const handleOffline = () => {
      clearTimeout(onlineTimeout);
      setIsOnline(false);
      toast({
        title: "📴 You're Offline",
        description: "Changes saved locally - will sync when online.",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearTimeout(onlineTimeout);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  // Sync pending actions when coming back online with retry logic
  useEffect(() => {
    if (isOnline && pendingActions.length > 0 && !isSyncing) {
      // Clear any existing timeout
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      // Small delay to ensure stable connection
      syncTimeoutRef.current = setTimeout(() => {
        syncPendingActions();
      }, 1000);
    }
    
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [isOnline, pendingActions.length]);

  // Cache a single image for offline use with retry
  const cacheImage = useCallback(async (imageUrl: string, retries = 3): Promise<boolean> => {
    if (!imageUrl) return false;
    
    for (let attempt = 0; attempt < retries; attempt++) {
      // Try Cache API first (more efficient)
      const cachedWithAPI = await cacheImageWithCacheAPI(imageUrl);
      if (cachedWithAPI) return true;
      
      // Fallback to base64 in localStorage
      const base64 = await imageToBase64(imageUrl);
      if (base64) {
        try {
          const cached = JSON.parse(SafeStorage.getItem(OFFLINE_IMAGES_KEY) || '{}');
          cached[imageUrl] = { data: base64, timestamp: Date.now() };
          if (SafeStorage.setItem(OFFLINE_IMAGES_KEY, JSON.stringify(cached))) {
            return true;
          }
        } catch {
          // Storage might be full - try to clear some space
          await clearExpiredCache();
        }
      }
      
      // Wait before retry
      if (attempt < retries - 1) {
        await new Promise(r => setTimeout(r, RETRY_DELAY_BASE * (attempt + 1)));
      }
    }
    return false;
  }, []);

  // Get cached image URL with fallback chain
  const getCachedImage = useCallback(async (imageUrl: string): Promise<string> => {
    if (!imageUrl) return '';
    if (isOnline) return imageUrl;
    
    // Try Cache API first
    const cachedFromAPI = await getCachedImageFromCacheAPI(imageUrl);
    if (cachedFromAPI) return cachedFromAPI;
    
    // Fallback to localStorage base64
    try {
      const cached = JSON.parse(SafeStorage.getItem(OFFLINE_IMAGES_KEY) || '{}');
      if (cached[imageUrl]?.data) {
        return cached[imageUrl].data;
      }
    } catch {
      // Ignore
    }
    
    return imageUrl; // Return original as final fallback
  }, [isOnline]);

  // Cache products for offline use with progress tracking
  const cacheProductsForOffline = useCallback(async (includeImages = true) => {
    if (!isOnline) return;
    
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(150); // Increased limit
      
      if (error) throw error;
      
      if (products?.length) {
        SafeStorage.setItem(OFFLINE_PRODUCTS_KEY, JSON.stringify({
          data: products,
          timestamp: Date.now()
        }));

        // Cache images in background with concurrency control
        if (includeImages) {
          const allImages: string[] = [];
          products.forEach(product => {
            if (product.image_url) allImages.push(product.image_url);
            if (product.images?.length) allImages.push(...product.images.slice(0, 3)); // Limit to first 3 images per product
          });

          const uniqueImages = [...new Set(allImages)].filter(Boolean);
          setCacheProgress({ current: 0, total: uniqueImages.length });

          // Cache images in smaller batches for reliability
          const batchSize = 3;
          for (let i = 0; i < uniqueImages.length; i += batchSize) {
            const batch = uniqueImages.slice(i, i + batchSize);
            await Promise.allSettled(batch.map(url => cacheImage(url)));
            setCacheProgress({ current: Math.min(i + batchSize, uniqueImages.length), total: uniqueImages.length });
          }
        }
      }

      const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true);
      
      if (categories) {
        SafeStorage.setItem(OFFLINE_CATEGORIES_KEY, JSON.stringify({
          data: categories,
          timestamp: Date.now()
        }));
      }

      await updateStorageUsage();

      toast({
        title: "✅ Ready for Offline",
        description: `${products?.length || 0} products cached`,
      });
    } catch (error) {
      console.error('[OfflineSync] Failed to cache products:', error);
    } finally {
      setCacheProgress({ current: 0, total: 0 });
    }
  }, [isOnline, cacheImage, toast, updateStorageUsage]);

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

  // Get cached product detail with validation
  const getCachedProductDetail = useCallback((productId: string): CachedProduct | null => {
    try {
      const cached = JSON.parse(SafeStorage.getItem(OFFLINE_PRODUCT_DETAILS_KEY) || '{}');
      const productCache = cached[productId];
      if (productCache?.data) {
        if (Date.now() - productCache.timestamp < CACHE_VALIDITY) {
          return productCache.data;
        }
      }
    } catch {
      // Ignore
    }
    return null;
  }, []);

  // Get cached products when offline with validation
  const getOfflineProducts = useCallback((): CachedProduct[] | null => {
    const cached = SafeStorage.getItem(OFFLINE_PRODUCTS_KEY);
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_VALIDITY && Array.isArray(data)) {
          return data;
        }
      } catch {
        SafeStorage.removeItem(OFFLINE_PRODUCTS_KEY);
      }
    }
    return null;
  }, []);

  const getOfflineCategories = useCallback(() => {
    const cached = SafeStorage.getItem(OFFLINE_CATEGORIES_KEY);
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_VALIDITY && Array.isArray(data)) {
          return data;
        }
      } catch {
        SafeStorage.removeItem(OFFLINE_CATEGORIES_KEY);
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
        const cached = JSON.parse(SafeStorage.getItem(OFFLINE_PRODUCT_DETAILS_KEY) || '{}');
        products.forEach(product => {
          cached[product.id] = { data: product, timestamp: Date.now() };
        });
        SafeStorage.setItem(OFFLINE_PRODUCT_DETAILS_KEY, JSON.stringify(cached));
        
        // Cache images
        const allImages = products.flatMap(p => [p.image_url, ...(p.images || [])].slice(0, 2)).filter(Boolean);
        await Promise.allSettled(allImages.slice(0, 20).map(url => cacheImage(url)));
      }
    } catch (e) {
      console.warn('[OfflineSync] Failed to preload category:', e);
    }
  }, [isOnline, cacheImage]);

  const addPendingAction = useCallback((action: Omit<PendingAction, 'id' | 'timestamp' | 'retryCount'>) => {
    const newAction: PendingAction = {
      ...action,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      retryCount: 0,
    };
    setPendingActions(prev => [...prev, newAction]);
  }, []);

  const syncPendingActions = async () => {
    if (isSyncing || pendingActions.length === 0 || !isOnline) return;

    setIsSyncing(true);
    const successfulIds: string[] = [];
    const failedActions: PendingAction[] = [];

    for (const action of pendingActions) {
      try {
        switch (action.type) {
          case 'wishlist':
            if (action.action === 'create') {
              const wishlistData = action.data as WishlistData;
              const { error } = await supabase.from('wishlist').insert({
                product_id: wishlistData.product_id,
                user_id: wishlistData.user_id,
              });
              if (error) throw error;
            } else if (action.action === 'delete') {
              const deleteData = action.data as { id: string };
              const { error } = await supabase.from('wishlist').delete().eq('id', deleteData.id);
              if (error) throw error;
            }
            break;
          case 'review':
            if (action.action === 'create') {
              const reviewData = action.data as ReviewData;
              const { error } = await supabase.from('reviews').insert({
                product_id: reviewData.product_id,
                user_id: reviewData.user_id,
                rating: reviewData.rating,
                comment: reviewData.comment,
              });
              if (error) throw error;
            }
            break;
        }
        successfulIds.push(action.id);
      } catch (error) {
        console.error('[OfflineSync] Failed to sync action:', action, error);
        // Retry with exponential backoff
        if (action.retryCount < MAX_RETRY_COUNT) {
          failedActions.push({
            ...action,
            retryCount: action.retryCount + 1
          });
        }
        // If max retries exceeded, remove the action
      }
    }

    // Update pending actions - keep failed ones for retry
    setPendingActions(prev => {
      const remaining = prev.filter(a => !successfulIds.includes(a.id) && !failedActions.find(f => f.id === a.id));
      return [...remaining, ...failedActions];
    });
    
    setIsSyncing(false);
    
    // Update last sync time
    const now = new Date();
    setLastSyncTime(now);
    SafeStorage.setItem('last-sync-time', now.toISOString());

    if (successfulIds.length > 0) {
      toast({
        title: "✅ Sync Complete",
        description: `${successfulIds.length} changes synced`,
      });
    }

    // Refresh offline cache after sync
    if (successfulIds.length > 0) {
      cacheProductsForOffline(false); // Don't re-cache images
    }
  };

  // Cache data for offline use
  const cacheData = useCallback((key: string, data: unknown) => {
    const cached = JSON.parse(SafeStorage.getItem(OFFLINE_DATA_KEY) || '{}');
    cached[key] = {
      data,
      timestamp: Date.now(),
    };
    SafeStorage.setItem(OFFLINE_DATA_KEY, JSON.stringify(cached));
  }, []);

  // Get cached data
  const getCachedData = useCallback(<T,>(key: string): T | null => {
    try {
      const cached = JSON.parse(SafeStorage.getItem(OFFLINE_DATA_KEY) || '{}');
      return cached[key]?.data || null;
    } catch {
      return null;
    }
  }, []);

  // Clear expired cache with comprehensive cleanup
  const clearExpiredCache = useCallback(async () => {
    const now = Date.now();

    // Clear expired generic cache
    try {
      const cached = JSON.parse(SafeStorage.getItem(OFFLINE_DATA_KEY) || '{}');
      Object.keys(cached).forEach(key => {
        if (now - cached[key].timestamp > CACHE_VALIDITY) {
          delete cached[key];
        }
      });
      SafeStorage.setItem(OFFLINE_DATA_KEY, JSON.stringify(cached));
    } catch {
      SafeStorage.removeItem(OFFLINE_DATA_KEY);
    }

    // Clear expired product details
    try {
      const productDetails = JSON.parse(SafeStorage.getItem(OFFLINE_PRODUCT_DETAILS_KEY) || '{}');
      Object.keys(productDetails).forEach(key => {
        if (now - productDetails[key].timestamp > CACHE_VALIDITY) {
          delete productDetails[key];
        }
      });
      SafeStorage.setItem(OFFLINE_PRODUCT_DETAILS_KEY, JSON.stringify(productDetails));
    } catch {
      SafeStorage.removeItem(OFFLINE_PRODUCT_DETAILS_KEY);
    }

    // Clear expired images from localStorage
    try {
      const images = JSON.parse(SafeStorage.getItem(OFFLINE_IMAGES_KEY) || '{}');
      Object.keys(images).forEach(key => {
        if (now - images[key].timestamp > CACHE_VALIDITY) {
          delete images[key];
        }
      });
      SafeStorage.setItem(OFFLINE_IMAGES_KEY, JSON.stringify(images));
    } catch {
      SafeStorage.removeItem(OFFLINE_IMAGES_KEY);
    }

    await updateStorageUsage();
  }, [updateStorageUsage]);

  // Initialize - cache products and clear expired cache
  useEffect(() => {
    if (isOnline && isInitializedRef.current) {
      // Delay initial cache to not block rendering
      const timer = setTimeout(() => {
        clearExpiredCache();
        cacheProductsForOffline(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  return {
    isOnline,
    isSyncing,
    pendingActions,
    pendingCount: pendingActions.length,
    lastSyncTime,
    cacheProgress,
    storageUsage,
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
    updateStorageUsage,
  };
};
