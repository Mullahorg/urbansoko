import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Filter, Grid, List, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import ProductCard from '@/components/Product/ProductCard';
import QuickView from '@/components/Product/QuickView';
import { products } from '@/data/products';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/utils/currency';

const CategoryPage = () => {
  const { category, subcategory } = useParams();
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const { addToCart } = useCart();

  // Filter products by category
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => 
      product.category.toLowerCase() === category?.toLowerCase()
    );

    // Apply price filter
    filtered = filtered.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Apply size filter
    if (selectedSizes.length > 0) {
      filtered = filtered.filter(product =>
        product.sizes.some(size => selectedSizes.includes(size))
      );
    }

    // Apply color filter
    if (selectedColors.length > 0) {
      filtered = filtered.filter(product =>
        product.colors.some(color => selectedColors.includes(color))
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
        filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      default:
        // Featured - show new and sale items first
        filtered.sort((a, b) => {
          const aScore = (a.isNew ? 2 : 0) + (a.isSale ? 1 : 0);
          const bScore = (b.isNew ? 2 : 0) + (b.isSale ? 1 : 0);
          return bScore - aScore;
        });
    }

    return filtered;
  }, [category, priceRange, selectedSizes, selectedColors, sortBy]);

  const handleToggleWishlist = (productId: string) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleQuickView = (product: any) => {
    setQuickViewProduct(product);
    setIsQuickViewOpen(true);
  };

  const handleSizeToggle = (size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size)
        ? prev.filter(s => s !== size)
        : [...prev, size]
    );
  };

  const handleColorToggle = (color: string) => {
    setSelectedColors(prev =>
      prev.includes(color)
        ? prev.filter(c => c !== color)
        : [...prev, color]
    );
  };

  const clearFilters = () => {
    setPriceRange([0, 50000]);
    setSelectedSizes([]);
    setSelectedColors([]);
  };

  // Get unique sizes and colors from filtered category products
  const categoryProducts = products.filter(p => p.category.toLowerCase() === category?.toLowerCase());
  const availableSizes = [...new Set(categoryProducts.flatMap(p => p.sizes))];
  const availableColors = [...new Set(categoryProducts.flatMap(p => p.colors))];

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Price Range</h3>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={50000}
            min={0}
            step={500}
            className="mb-2"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{formatPrice(priceRange[0])}</span>
            <span>{formatPrice(priceRange[1])}</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Sizes</h3>
        <div className="grid grid-cols-3 gap-2">
          {availableSizes.map(size => (
            <div key={size} className="flex items-center space-x-2">
              <Checkbox
                id={`size-${size}`}
                checked={selectedSizes.includes(size)}
                onCheckedChange={() => handleSizeToggle(size)}
              />
              <label
                htmlFor={`size-${size}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {size}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Colors</h3>
        <div className="grid grid-cols-2 gap-2">
          {availableColors.map(color => (
            <div key={color} className="flex items-center space-x-2">
              <Checkbox
                id={`color-${color}`}
                checked={selectedColors.includes(color)}
                onCheckedChange={() => handleColorToggle(color)}
              />
              <label
                htmlFor={`color-${color}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {color}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Button variant="outline" onClick={clearFilters} className="w-full">
        Clear Filters
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8 animate-fade-in">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-2 overflow-x-auto scrollbar-hide">
            <span className="whitespace-nowrap">Home</span>
            <span>/</span>
            <span className="capitalize whitespace-nowrap">{category}</span>
            {subcategory && (
              <>
                <span>/</span>
                <span className="capitalize whitespace-nowrap">{subcategory.replace('-', ' ')}</span>
              </>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold capitalize mb-2">
            {subcategory ? subcategory.replace('-', ' ') : category}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Discover our collection of {filteredProducts.length} premium {category?.toLowerCase()}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          {/* Desktop Filters */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <Card className="sticky top-4">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <SlidersHorizontal className="h-4 w-4" />
                  <h2 className="font-semibold text-base">Filters</h2>
                </div>
                <FilterContent />
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 p-3 sm:p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 sm:gap-4">
                <Sheet open={showFilters} onOpenChange={setShowFilters}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden h-9">
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                      {(selectedSizes.length > 0 || selectedColors.length > 0) && (
                        <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                          {selectedSizes.length + selectedColors.length}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[85vw] sm:w-96">
                    <SheetHeader>
                      <SheetTitle className="text-base sm:text-lg">Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6 overflow-y-auto max-h-[calc(100vh-8rem)]">
                      <FilterContent />
                    </div>
                  </SheetContent>
                </Sheet>

                <div className="hidden sm:flex items-center gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="h-9 w-9 p-0"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="h-9 w-9 p-0"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                </span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-36 sm:w-40 h-9 text-xs sm:text-sm">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="name">Name A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters Display */}
            {(selectedSizes.length > 0 || selectedColors.length > 0 || priceRange[0] > 0 || priceRange[1] < 50000) && (
              <div className="flex flex-wrap items-center gap-2 mb-4 p-3 bg-card border rounded-lg animate-fade-in">
                <span className="text-xs sm:text-sm font-medium">Active filters:</span>
                {selectedSizes.map(size => (
                  <Badge key={size} variant="secondary" className="text-xs">
                    Size: {size}
                    <button onClick={() => handleSizeToggle(size)} className="ml-1 hover:text-destructive">×</button>
                  </Badge>
                ))}
                {selectedColors.map(color => (
                  <Badge key={color} variant="secondary" className="text-xs">
                    {color}
                    <button onClick={() => handleColorToggle(color)} className="ml-1 hover:text-destructive">×</button>
                  </Badge>
                ))}
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 text-xs ml-auto">
                  Clear all
                </Button>
              </div>
            )}

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12 sm:py-16 animate-fade-in">
                <div className="max-w-md mx-auto">
                  <p className="text-base sm:text-lg text-muted-foreground mb-4">No products found matching your criteria</p>
                  <Button onClick={clearFilters} className="h-10">Clear All Filters</Button>
                </div>
              </div>
            ) : (
              <div className={`grid gap-4 sm:gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  : 'grid-cols-1'
              }`}>
                {filteredProducts.map((product, index) => (
                  <div 
                    key={product.id} 
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <ProductCard
                      product={product}
                      onAddToCart={addToCart}
                      onToggleWishlist={handleToggleWishlist}
                      onQuickView={handleQuickView}
                      isWishlisted={wishlist.includes(product.id)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick View Modal */}
        <QuickView
          product={quickViewProduct}
          isOpen={isQuickViewOpen}
          onClose={() => setIsQuickViewOpen(false)}
          onToggleWishlist={handleToggleWishlist}
          isWishlisted={quickViewProduct ? wishlist.includes(quickViewProduct.id) : false}
        />
      </div>
    </div>
  );
};

export default CategoryPage;