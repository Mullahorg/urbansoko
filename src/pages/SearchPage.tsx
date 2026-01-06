import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, Sparkles, TrendingUp, Filter, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ProductCard from '@/components/Product/ProductCard';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
    loadRecentSearches();
  }, []);

  const loadRecentSearches = () => {
    try {
      const saved = localStorage.getItem('recentSearches');
      if (saved) {
        setRecentSearches(JSON.parse(saved).slice(0, 5));
      }
    } catch {}
  };

  const saveSearch = (query: string) => {
    if (!query.trim()) return;
    try {
      const searches = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
      localStorage.setItem('recentSearches', JSON.stringify(searches));
      setRecentSearches(searches);
    } catch {}
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
      saveSearch(searchQuery.trim());
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setSearchParams({ q: suggestion });
    saveSearch(suggestion);
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
      // Check name
      if (smartMatch(query, product.name)) return true;
      // Check category
      if (smartMatch(query, product.category)) return true;
      // Check description
      if (product.description && smartMatch(query, product.description)) return true;
      // Check colors
      if (product.colors?.some((c: string) => smartMatch(query, c))) return true;
      // Check sizes
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
              {showSuggestions && (autocompleteSuggestions.length > 0 || smartSuggestions.length > 0 || recentSearches.length > 0) && (
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
                      <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Recent searches
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {recentSearches.map((search) => (
                          <Badge
                            key={search}
                            variant="outline"
                            className="cursor-pointer hover:bg-muted transition-colors"
                            onClick={() => handleSuggestionClick(search)}
                          >
                            {search}
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

        {/* Initial State - Popular Categories */}
        {!currentQuery && (
          <div className="text-center py-8">
            <Search className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-lg font-medium mb-2">Start searching</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Type to find products, categories, colors, and more
            </p>

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="max-w-md mx-auto">
                <p className="text-sm text-muted-foreground mb-3">Recent searches</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {recentSearches.map((search) => (
                    <Badge
                      key={search}
                      variant="outline"
                      className="cursor-pointer hover:bg-muted transition-colors py-1.5 px-3"
                      onClick={() => handleSuggestionClick(search)}
                    >
                      {search}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
