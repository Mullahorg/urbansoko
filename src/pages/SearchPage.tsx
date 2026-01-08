import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useIntegratedAnalytics } from '@/hooks/useIntegratedAnalytics';
import { Search, X, Sparkles, TrendingUp, Filter, Clock, Flame, Eye, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import ProductCard from '@/components/Product/ProductCard';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchAnalytics } from '@/hooks/useSearchAnalytics';
import {
  smartMatch,
  calculateRelevanceScore,
  getSuggestedTerms,
  getAutocompleteSuggestions,
  parseSearchQuery,
  detectCategories,
} from '@/utils/smartSearch';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  const {
    recentSearches,
    trendingSearches,
    viewedProducts,
    trendingProducts,
    trackSearch,
    trackProductView,
    getRecommendations,
    clearSearchHistory,
  } = useSearchAnalytics();

  useEffect(() => {
    fetchProducts();
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    const recs = await getRecommendations();
    setRecommendations(recs);
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast({
        title: 'Error loading products',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery });
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setSearchParams({ q: suggestion });
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchParams({});
    setShowSuggestions(false);
  };

  // Autocomplete suggestions
  const autocompleteSuggestions = useMemo(() => {
    if (searchQuery.length < 2) return [];
    return getAutocompleteSuggestions(searchQuery, products);
  }, [searchQuery, products]);

  // Smart suggestions based on typos
  const smartSuggestions = useMemo(() => {
    if (searchQuery.length < 2) return [];
    return getSuggestedTerms(searchQuery);
  }, [searchQuery]);

  // Parse query for advanced features
  const parsedQuery = useMemo(() => {
    const query = searchParams.get('q') || '';
    return parseSearchQuery(query);
  }, [searchParams]);

  // Detected categories
  const detectedCategories = useMemo(() => {
    const query = searchParams.get('q') || '';
    return detectCategories(query);
  }, [searchParams]);

  // Smart search results with fuzzy matching and relevance scoring
  const searchResults = useMemo(() => {
    const query = searchParams.get('q')?.toLowerCase() || '';
    if (!query) return [];

    // Filter products using smart matching
    const matched = products.filter(product => {
      if (smartMatch(query, product.name)) return true;
      if (smartMatch(query, product.category)) return true;
      if (product.description && smartMatch(query, product.description)) return true;
      if (product.colors?.some((c: string) => smartMatch(query, c))) return true;
      if (product.sizes?.some((s: string) => smartMatch(query, s))) return true;
      return false;
    });

    // Sort by relevance score
    return matched
      .map(product => ({
        ...product,
        relevanceScore: calculateRelevanceScore(query, {
          name: product.name,
          category: product.category,
          description: product.description,
          colors: product.colors,
          sizes: product.sizes,
        }),
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  }, [products, searchParams]);

  // Track search when results change
  useEffect(() => {
    const query = searchParams.get('q');
    if (query && searchResults.length >= 0) {
      trackSearch(query, searchResults.length);
    }
  }, [searchParams, searchResults.length, trackSearch]);

  // Alternative suggestions when no results
  const alternativeSuggestions = useMemo(() => {
    if (searchResults.length > 0) return [];
    const query = searchParams.get('q') || '';
    if (!query) return [];
    return getSuggestedTerms(query);
  }, [searchResults, searchParams]);

  const handleToggleWishlist = (productId: string) => {
    setWishlist(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Track product view on card click
  const handleProductClick = (product: any) => {
    trackProductView(product);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const currentQuery = searchParams.get('q');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4 md:py-8">
        {/* Search Header */}
        <div className="max-w-2xl mx-auto mb-6 md:mb-8">
          <h1 className="text-xl md:text-3xl font-bold mb-4 md:mb-6 text-center flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            Smart Search
          </h1>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 md:h-5 md:w-5" />
              <Input
                type="text"
                placeholder="Search products... (e.g., tshirt, t-shirt, blue dress)"
                className="pl-10 pr-20 h-12 md:h-14 text-base md:text-lg"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                {searchQuery && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={clearSearch}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                <Button type="submit" size="sm" className="h-8">
                  Search
                </Button>
              </div>
            </div>

            {/* Autocomplete Dropdown */}
            <AnimatePresence>
              {showSuggestions && (autocompleteSuggestions.length > 0 || smartSuggestions.length > 0 || recentSearches.length > 0 || trendingSearches.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden"
                >
                  {/* Smart Suggestions */}
                  {smartSuggestions.length > 0 && (
                    <div className="p-3 border-b border-border">
                      <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        Did you mean?
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {smartSuggestions.map((suggestion) => (
                          <Badge
                            key={suggestion}
                            variant="secondary"
                            className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            {suggestion}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trending Searches */}
                  {trendingSearches.length > 0 && searchQuery.length < 2 && (
                    <div className="p-3 border-b border-border">
                      <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                        <Flame className="h-3 w-3 text-orange-500" />
                        Trending
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {trendingSearches.map((item) => (
                          <Badge
                            key={item.query}
                            variant="outline"
                            className="cursor-pointer hover:bg-orange-500/10 hover:border-orange-500/50 transition-colors"
                            onClick={() => handleSuggestionClick(item.query)}
                          >
                            <Flame className="h-3 w-3 mr-1 text-orange-500" />
                            {item.query}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Autocomplete */}
                  {autocompleteSuggestions.length > 0 && (
                    <div className="max-h-48 overflow-y-auto">
                      {autocompleteSuggestions.map((suggestion, index) => (
                        <button
                          key={`${suggestion}-${index}`}
                          type="button"
                          className="w-full px-4 py-2.5 text-left hover:bg-muted transition-colors flex items-center gap-2 text-sm"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          <Search className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{suggestion}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Recent Searches */}
                  {recentSearches.length > 0 && searchQuery.length < 2 && (
                    <div className="p-3 border-t border-border">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Recent searches
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs text-muted-foreground hover:text-foreground"
                          onClick={(e) => {
                            e.preventDefault();
                            clearSearchHistory();
                          }}
                        >
                          Clear
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {recentSearches.map((item) => (
                          <Badge
                            key={item.query}
                            variant="outline"
                            className="cursor-pointer hover:bg-muted transition-colors"
                            onClick={() => handleSuggestionClick(item.query)}
                          >
                            {item.query}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          {/* Search Tips */}
          <p className="text-xs text-muted-foreground text-center mt-2">
            Smart search understands typos and variations (tshirt = t-shirt = tee)
          </p>
        </div>

        {/* Search Results */}
        {currentQuery && (
          <div className="mb-6 md:mb-8">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <div>
                <h2 className="text-lg md:text-xl font-semibold">
                  Results for "{currentQuery}"
                </h2>
                <p className="text-sm text-muted-foreground">
                  {searchResults.length} product{searchResults.length !== 1 ? 's' : ''} found
                </p>
              </div>

              {/* Detected Categories */}
              {detectedCategories.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Detected:</span>
                  {detectedCategories.map((cat) => (
                    <Badge key={cat} variant="outline" className="text-xs">
                      {cat}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Parsed Query Info */}
            {(parsedQuery.colors.length > 0 || parsedQuery.sizes.length > 0) && (
              <div className="flex flex-wrap items-center gap-2 mb-4 p-3 bg-muted/50 rounded-lg">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Filtering by:</span>
                {parsedQuery.colors.map((color) => (
                  <Badge key={color} variant="secondary" className="capitalize">
                    {color}
                  </Badge>
                ))}
                {parsedQuery.sizes.map((size) => (
                  <Badge key={size} variant="secondary" className="uppercase">
                    {size}
                  </Badge>
                ))}
              </div>
            )}

            {/* No Results */}
            {searchResults.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 bg-muted/30 rounded-xl"
              >
                <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No products found</p>
                <p className="text-sm text-muted-foreground mb-4">
                  We couldn't find products matching "{currentQuery}"
                </p>

                {/* Alternative Suggestions */}
                {alternativeSuggestions.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-2">Try searching for:</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {alternativeSuggestions.map((suggestion) => (
                        <Button
                          key={suggestion}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <Button variant="secondary" onClick={clearSearch}>
                  Clear search
                </Button>
              </motion.div>
            ) : (
              /* Product Grid */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6"
              >
                {searchResults.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleProductClick(product)}
                  >
                    <ProductCard
                      product={{
                        ...product,
                        image: product.image_url || product.images?.[0],
                        sizes: product.sizes || [],
                        colors: product.colors || [],
                        inStock: product.stock > 0,
                      }}
                      onAddToCart={addToCart}
                      onToggleWishlist={handleToggleWishlist}
                      isWishlisted={wishlist.includes(product.id)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        )}

        {/* Initial State - Discovery Section */}
        {!currentQuery && (
          <div className="space-y-8">
            {/* Trending Products */}
            {trendingProducts.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">
                    <Flame className="h-5 w-5 text-orange-500" />
                    Trending Now
                  </h2>
                  <Link to="/products" className="text-sm text-primary flex items-center gap-1 hover:underline">
                    View all <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                  {trendingProducts.slice(0, 4).map((product) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={() => handleProductClick(product)}
                    >
                      <ProductCard
                        product={{
                          ...product,
                          image: product.image_url || product.images?.[0],
                          sizes: product.sizes || [],
                          colors: product.colors || [],
                          inStock: product.stock > 0,
                        }}
                        onAddToCart={addToCart}
                        onToggleWishlist={handleToggleWishlist}
                        isWishlisted={wishlist.includes(product.id)}
                      />
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Recently Viewed */}
            {viewedProducts.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">
                    <Eye className="h-5 w-5 text-muted-foreground" />
                    Recently Viewed
                  </h2>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                  {viewedProducts.slice(0, 8).map((product) => (
                    <Link
                      key={product.id}
                      to={`/product/${product.id}`}
                      className="flex-shrink-0 w-32 md:w-40"
                    >
                      <Card className="overflow-hidden hover:shadow-md transition-shadow">
                        <div className="aspect-square bg-muted">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              No image
                            </div>
                          )}
                        </div>
                        <div className="p-2">
                          <p className="text-xs font-medium truncate">{product.name}</p>
                          <p className="text-xs text-muted-foreground">Ksh {product.price.toLocaleString()}</p>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Personalized Recommendations */}
            {recommendations.length > 0 && viewedProducts.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Recommended for You
                  </h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                  {recommendations.slice(0, 4).map((product) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={() => handleProductClick(product)}
                    >
                      <ProductCard
                        product={{
                          ...product,
                          image: product.image_url || product.images?.[0],
                          sizes: product.sizes || [],
                          colors: product.colors || [],
                          inStock: product.stock > 0,
                        }}
                        onAddToCart={addToCart}
                        onToggleWishlist={handleToggleWishlist}
                        isWishlisted={wishlist.includes(product.id)}
                      />
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Quick Search Prompts */}
            <section className="text-center py-6">
              <Search className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <h2 className="text-lg font-medium mb-2">What are you looking for?</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Type to search or try these popular categories
              </p>

              {/* Trending Searches */}
              {trendingSearches.length > 0 && (
                <div className="max-w-md mx-auto mb-4">
                  <p className="text-xs text-muted-foreground mb-2 flex items-center justify-center gap-1">
                    <Flame className="h-3 w-3 text-orange-500" />
                    Trending searches
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {trendingSearches.map((item) => (
                      <Badge
                        key={item.query}
                        variant="secondary"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors py-1.5 px-3"
                        onClick={() => handleSuggestionClick(item.query)}
                      >
                        {item.query}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="max-w-md mx-auto">
                  <p className="text-xs text-muted-foreground mb-2 flex items-center justify-center gap-1">
                    <Clock className="h-3 w-3" />
                    Your recent searches
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {recentSearches.map((item) => (
                      <Badge
                        key={item.query}
                        variant="outline"
                        className="cursor-pointer hover:bg-muted transition-colors py-1.5 px-3"
                        onClick={() => handleSuggestionClick(item.query)}
                      >
                        {item.query}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
