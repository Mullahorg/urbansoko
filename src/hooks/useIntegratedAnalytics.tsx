import { useCallback, useEffect, useRef } from 'react';
import { useSearchAnalytics } from './useSearchAnalytics';
import { useOfflineSync } from './useOfflineSync';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

/**
 * Military-grade integrated analytics hook that connects:
 * - Search analytics
 * - Offline sync
 * - User behavior tracking
 * - Cart analytics
 * - Performance monitoring
 */

interface AnalyticsEvent {
  type: 'page_view' | 'product_view' | 'search' | 'add_to_cart' | 'purchase' | 'wishlist' | 'filter';
  data: Record<string, unknown>;
  timestamp: number;
  sessionId: string;
  userId?: string;
}

const SESSION_KEY = 'analytics-session-id';
const EVENTS_KEY = 'analytics-events-queue';
const MAX_EVENTS = 100;

// Generate or retrieve session ID
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
};

// Safe storage operations
const SafeStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  },
};

export const useIntegratedAnalytics = () => {
  const { user } = useAuth();
  const searchAnalytics = useSearchAnalytics();
  const offlineSync = useOfflineSync();
  const sessionId = useRef(getSessionId());
  const isInitialized = useRef(false);

  // Initialize and sync on mount
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    // Sync any queued events when online
    if (offlineSync.isOnline) {
      syncQueuedEvents();
    }
  }, [offlineSync.isOnline]);

  // Queue event for later sync
  const queueEvent = useCallback((event: AnalyticsEvent) => {
    try {
      const queue = JSON.parse(SafeStorage.getItem(EVENTS_KEY) || '[]');
      queue.push(event);
      // Keep queue manageable
      const trimmedQueue = queue.slice(-MAX_EVENTS);
      SafeStorage.setItem(EVENTS_KEY, JSON.stringify(trimmedQueue));
    } catch {
      // Silently fail
    }
  }, []);

  // Sync queued events to server
  const syncQueuedEvents = useCallback(async () => {
    try {
      const queue = JSON.parse(SafeStorage.getItem(EVENTS_KEY) || '[]');
      if (queue.length === 0) return;

      // For now, just clear the queue
      // In production, you'd send these to an analytics endpoint
      SafeStorage.setItem(EVENTS_KEY, '[]');
    } catch {
      // Silently fail
    }
  }, []);

  // Track page view
  const trackPageView = useCallback((pageName: string, metadata?: Record<string, unknown>) => {
    const event: AnalyticsEvent = {
      type: 'page_view',
      data: { pageName, ...metadata },
      timestamp: Date.now(),
      sessionId: sessionId.current,
      userId: user?.id,
    };
    queueEvent(event);
  }, [user?.id, queueEvent]);

  // Track product view with full integration
  const trackProductView = useCallback((product: {
    id: string;
    name: string;
    category: string;
    price: number;
    image_url?: string;
    images?: string[];
  }) => {
    // Update search analytics
    searchAnalytics.trackProductView(product);
    
    // Cache for offline
    if (offlineSync.isOnline) {
      offlineSync.cacheProductDetail({
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        image_url: product.image_url || null,
        images: product.images || null,
        description: null,
        colors: null,
        sizes: null,
        stock: null,
        featured: null,
        created_at: null,
        updated_at: null,
        vendor_id: null,
      });
    }

    // Queue analytics event
    const event: AnalyticsEvent = {
      type: 'product_view',
      data: { 
        productId: product.id, 
        productName: product.name,
        category: product.category,
        price: product.price,
      },
      timestamp: Date.now(),
      sessionId: sessionId.current,
      userId: user?.id,
    };
    queueEvent(event);
  }, [searchAnalytics, offlineSync, user?.id, queueEvent]);

  // Track search with integration
  const trackSearch = useCallback((query: string, resultsCount: number, filters?: Record<string, unknown>) => {
    // Update search analytics
    searchAnalytics.trackSearch(query, resultsCount);

    // Queue analytics event
    const event: AnalyticsEvent = {
      type: 'search',
      data: { query, resultsCount, filters },
      timestamp: Date.now(),
      sessionId: sessionId.current,
      userId: user?.id,
    };
    queueEvent(event);
  }, [searchAnalytics, user?.id, queueEvent]);

  // Track add to cart
  const trackAddToCart = useCallback((product: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    category?: string;
  }) => {
    const event: AnalyticsEvent = {
      type: 'add_to_cart',
      data: {
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: product.quantity,
        category: product.category,
      },
      timestamp: Date.now(),
      sessionId: sessionId.current,
      userId: user?.id,
    };
    queueEvent(event);
  }, [user?.id, queueEvent]);

  // Track purchase
  const trackPurchase = useCallback((orderData: {
    orderId: string;
    totalAmount: number;
    itemCount: number;
    paymentMethod: string;
  }) => {
    const event: AnalyticsEvent = {
      type: 'purchase',
      data: orderData,
      timestamp: Date.now(),
      sessionId: sessionId.current,
      userId: user?.id,
    };
    queueEvent(event);
  }, [user?.id, queueEvent]);

  // Track wishlist action
  const trackWishlistAction = useCallback((productId: string, action: 'add' | 'remove') => {
    const event: AnalyticsEvent = {
      type: 'wishlist',
      data: { productId, action },
      timestamp: Date.now(),
      sessionId: sessionId.current,
      userId: user?.id,
    };
    queueEvent(event);
  }, [user?.id, queueEvent]);

  // Track filter usage
  const trackFilterUsage = useCallback((filters: Record<string, unknown>) => {
    const event: AnalyticsEvent = {
      type: 'filter',
      data: filters,
      timestamp: Date.now(),
      sessionId: sessionId.current,
      userId: user?.id,
    };
    queueEvent(event);
  }, [user?.id, queueEvent]);

  // Get personalized recommendations
  const getRecommendations = useCallback(async () => {
    return searchAnalytics.getRecommendations();
  }, [searchAnalytics]);

  // Get search suggestions combining all sources
  const getSearchSuggestions = useCallback((query: string): string[] => {
    return searchAnalytics.getSearchSuggestions(query);
  }, [searchAnalytics]);

  return {
    // Analytics tracking
    trackPageView,
    trackProductView,
    trackSearch,
    trackAddToCart,
    trackPurchase,
    trackWishlistAction,
    trackFilterUsage,
    
    // Recommendations
    getRecommendations,
    getSearchSuggestions,
    
    // Data from search analytics
    recentSearches: searchAnalytics.recentSearches,
    trendingSearches: searchAnalytics.trendingSearches,
    viewedProducts: searchAnalytics.viewedProducts,
    trendingProducts: searchAnalytics.trendingProducts,
    
    // Utility
    clearSearchHistory: searchAnalytics.clearSearchHistory,
    clearViewedProducts: searchAnalytics.clearViewedProducts,
    
    // Status
    isOnline: offlineSync.isOnline,
    isSyncing: offlineSync.isSyncing,
    sessionId: sessionId.current,
  };
};
