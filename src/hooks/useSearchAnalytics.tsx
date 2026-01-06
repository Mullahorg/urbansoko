import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Storage keys
const SEARCH_HISTORY_KEY = 'search-history-v1';
const POPULAR_SEARCHES_KEY = 'popular-searches-v1';
const VIEWED_PRODUCTS_KEY = 'viewed-products-v1';
const ANALYTICS_LAST_SYNC = 'analytics-last-sync';
const MAX_HISTORY_ITEMS = 50;
const MAX_VIEWED_PRODUCTS = 30;

interface SearchHistoryItem {
  query: string;
  timestamp: number;
  resultsCount: number;
}

interface ViewedProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  viewCount: number;
  lastViewed: number;
}

interface PopularSearch {
  query: string;
  count: number;
  trending: boolean;
}

// Safe localStorage wrapper
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

export const useSearchAnalytics = () => {
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [viewedProducts, setViewedProducts] = useState<ViewedProduct[]>([]);
  const [popularSearches, setPopularSearches] = useState<PopularSearch[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    loadLocalData();
    fetchTrendingProducts();
  }, []);

  const loadLocalData = useCallback(() => {
    try {
      // Load search history
      const historyData = SafeStorage.getItem(SEARCH_HISTORY_KEY);
      if (historyData) {
        const parsed = JSON.parse(historyData);
        setSearchHistory(Array.isArray(parsed) ? parsed : []);
      }

      // Load viewed products
      const viewedData = SafeStorage.getItem(VIEWED_PRODUCTS_KEY);
      if (viewedData) {
        const parsed = JSON.parse(viewedData);
        setViewedProducts(Array.isArray(parsed) ? parsed : []);
      }

      // Load popular searches (local aggregation)
      const popularData = SafeStorage.getItem(POPULAR_SEARCHES_KEY);
      if (popularData) {
        const parsed = JSON.parse(popularData);
        setPopularSearches(Array.isArray(parsed) ? parsed : []);
      }
    } catch {
      // Silently fail
    }
  }, []);

  // Fetch trending products based on order frequency
  const fetchTrendingProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Get products ordered by featured and creation date as proxy for trending
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(8);

      if (!error && data) {
        setTrendingProducts(data);
      }
    } catch {
      // Silently fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Track a search query
  const trackSearch = useCallback((query: string, resultsCount: number) => {
    if (!query.trim()) return;

    const normalizedQuery = query.toLowerCase().trim();
    const newItem: SearchHistoryItem = {
      query: normalizedQuery,
      timestamp: Date.now(),
      resultsCount,
    };

    setSearchHistory(prev => {
      // Remove duplicate if exists
      const filtered = prev.filter(item => item.query !== normalizedQuery);
      const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      SafeStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });

    // Update popular searches aggregation
    updatePopularSearches(normalizedQuery);
  }, []);

  // Update popular searches based on local history
  const updatePopularSearches = useCallback((query: string) => {
    setPopularSearches(prev => {
      const existing = prev.find(p => p.query === query);
      let updated: PopularSearch[];
      
      if (existing) {
        updated = prev.map(p => 
          p.query === query 
            ? { ...p, count: p.count + 1, trending: p.count > 3 }
            : p
        );
      } else {
        updated = [...prev, { query, count: 1, trending: false }];
      }

      // Sort by count and limit
      updated = updated
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);

      // Mark top 5 as trending
      updated = updated.map((p, i) => ({ ...p, trending: i < 5 && p.count > 2 }));

      SafeStorage.setItem(POPULAR_SEARCHES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Track a product view
  const trackProductView = useCallback((product: {
    id: string;
    name: string;
    category: string;
    price: number;
    image_url?: string;
    images?: string[];
  }) => {
    setViewedProducts(prev => {
      const existing = prev.find(p => p.id === product.id);
      let updated: ViewedProduct[];

      if (existing) {
        updated = prev.map(p =>
          p.id === product.id
            ? { ...p, viewCount: p.viewCount + 1, lastViewed: Date.now() }
            : p
        );
      } else {
        const newProduct: ViewedProduct = {
          id: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          image: product.image_url || product.images?.[0] || '',
          viewCount: 1,
          lastViewed: Date.now(),
        };
        updated = [newProduct, ...prev];
      }

      // Sort by last viewed and limit
      updated = updated
        .sort((a, b) => b.lastViewed - a.lastViewed)
        .slice(0, MAX_VIEWED_PRODUCTS);

      SafeStorage.setItem(VIEWED_PRODUCTS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Get personalized recommendations based on viewing history
  const getRecommendations = useCallback(async (): Promise<any[]> => {
    if (viewedProducts.length === 0) {
      return trendingProducts;
    }

    try {
      // Get most viewed categories
      const categoryCounts: Record<string, number> = {};
      viewedProducts.forEach(p => {
        categoryCounts[p.category] = (categoryCounts[p.category] || 0) + p.viewCount;
      });

      const topCategories = Object.entries(categoryCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([cat]) => cat);

      if (topCategories.length === 0) return trendingProducts;

      // Fetch products from preferred categories
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .in('category', topCategories)
        .order('created_at', { ascending: false })
        .limit(12);

      if (error || !data) return trendingProducts;

      // Filter out already viewed products
      const viewedIds = new Set(viewedProducts.map(p => p.id));
      const recommendations = data.filter(p => !viewedIds.has(p.id));

      return recommendations.length > 0 ? recommendations : trendingProducts;
    } catch {
      return trendingProducts;
    }
  }, [viewedProducts, trendingProducts]);

  // Get recent searches (deduplicated and sorted)
  const recentSearches = useMemo(() => {
    const seen = new Set<string>();
    return searchHistory
      .filter(item => {
        if (seen.has(item.query)) return false;
        seen.add(item.query);
        return true;
      })
      .slice(0, 8);
  }, [searchHistory]);

  // Get trending searches
  const trendingSearches = useMemo(() => {
    return popularSearches
      .filter(p => p.trending)
      .slice(0, 5);
  }, [popularSearches]);

  // Clear search history
  const clearSearchHistory = useCallback(() => {
    setSearchHistory([]);
    SafeStorage.setItem(SEARCH_HISTORY_KEY, '[]');
  }, []);

  // Clear viewed products
  const clearViewedProducts = useCallback(() => {
    setViewedProducts([]);
    SafeStorage.setItem(VIEWED_PRODUCTS_KEY, '[]');
  }, []);

  // Get search suggestions based on history and popular
  const getSearchSuggestions = useCallback((query: string): string[] => {
    if (!query.trim()) {
      // Return recent + trending when no query
      const recent = recentSearches.slice(0, 4).map(s => s.query);
      const trending = trendingSearches.slice(0, 4).map(s => s.query);
      return [...new Set([...recent, ...trending])].slice(0, 6);
    }

    const normalizedQuery = query.toLowerCase().trim();
    const suggestions: string[] = [];

    // Add matching history
    searchHistory.forEach(item => {
      if (item.query.includes(normalizedQuery) && !suggestions.includes(item.query)) {
        suggestions.push(item.query);
      }
    });

    // Add matching popular
    popularSearches.forEach(item => {
      if (item.query.includes(normalizedQuery) && !suggestions.includes(item.query)) {
        suggestions.push(item.query);
      }
    });

    return suggestions.slice(0, 6);
  }, [searchHistory, popularSearches, recentSearches, trendingSearches]);

  return {
    // Data
    searchHistory,
    viewedProducts,
    popularSearches,
    trendingProducts,
    recentSearches,
    trendingSearches,
    isLoading,
    
    // Actions
    trackSearch,
    trackProductView,
    getRecommendations,
    getSearchSuggestions,
    clearSearchHistory,
    clearViewedProducts,
    fetchTrendingProducts,
  };
};
