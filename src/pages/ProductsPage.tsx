import { useState, useMemo, useEffect } from 'react';
import { Filter, Grid, List, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from '@/components/Product/ProductCard';
import QuickView from '@/components/Product/QuickView';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/utils/currency';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ProductsPage = () => {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsResult, categoriesResult] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').eq('is_active', true).order('name', { ascending: true }),
      ]);
      if (productsResult.error) throw productsResult.error;
      if (categoriesResult.error) throw categoriesResult.error;
      setProducts(productsResult.data || []);
      setCategories(categoriesResult.data || []);
    } catch (error: any) {
      toast({ title: 'Error loading data', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const filteredProducts = useMemo(() => {
    let filtered = [...products];
    filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(p => selectedCategories.includes(p.category));
    }
    switch (sortBy) {
      case 'price-low': filtered.sort((a, b) => a.price - b.price); break;
      case 'price-high': filtered.sort((a, b) => b.price - a.price); break;
      case 'name': filtered.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'newest': filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); break;
      default: filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }
    return filtered;
  }, [products, priceRange, selectedCategories, sortBy]);

  const handleToggleWishlist = (productId: string) => {
    setWishlist(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]);
  };

  const clearFilters = () => { setPriceRange([0, 50000]); setSelectedCategories([]); };

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium text-sm mb-3">Price Range</h3>
        <Slider value={priceRange} onValueChange={setPriceRange} max={50000} min={0} step={500} className="mb-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatPrice(priceRange[0])}</span>
          <span>{formatPrice(priceRange[1])}</span>
        </div>
      </div>
      <div>
        <h3 className="font-medium text-sm mb-3">Categories</h3>
        <div className="space-y-2">
          {categories.map((cat: any) => (
            <div key={cat.id} className="flex items-center space-x-2">
              <Checkbox id={`cat-${cat.id}`} checked={selectedCategories.includes(cat.name)} onCheckedChange={() => handleCategoryToggle(cat.name)} />
              <label htmlFor={`cat-${cat.id}`} className="text-sm cursor-pointer">{cat.name}</label>
            </div>
          ))}
        </div>
      </div>
      <Button variant="outline" onClick={clearFilters} className="w-full" size="sm">Clear Filters</Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold mb-1">All Products</h1>
          <p className="text-sm text-muted-foreground">{filteredProducts.length} products</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-20">
              <div className="flex items-center gap-2 mb-4">
                <SlidersHorizontal className="h-4 w-4" />
                <h2 className="font-medium text-sm">Filters</h2>
              </div>
              <FilterContent />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Sheet open={showFilters} onOpenChange={setShowFilters}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden">
                      <Filter className="h-4 w-4 mr-1" /> Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-72">
                    <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
                    <div className="mt-6"><FilterContent /></div>
                  </SheetContent>
                </Sheet>
                <div className="hidden sm:flex items-center gap-1">
                  <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setViewMode('grid')}><Grid className="h-3.5 w-3.5" /></Button>
                  <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => setViewMode('list')}><List className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-36 h-8 text-sm"><SelectValue placeholder="Sort by" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1,2,3,4,5,6,7,8].map(i => (
                  <Card key={i}><CardContent className="p-3"><Skeleton className="aspect-[3/4] w-full mb-3" /><Skeleton className="h-4 w-3/4 mb-2" /><Skeleton className="h-4 w-1/2" /></CardContent></Card>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground mb-4">No products found</p>
                <Button onClick={clearFilters} variant="outline" size="sm">Clear Filters</Button>
              </div>
            ) : (
              <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={{
                      ...product,
                      image: product.image_url || product.images?.[0],
                      sizes: product.sizes || [],
                      colors: product.colors || [],
                      inStock: product.stock > 0,
                      stock: product.stock,
                    }}
                    onAddToCart={addToCart}
                    onToggleWishlist={handleToggleWishlist}
                    onQuickView={(p) => { setQuickViewProduct(p); setIsQuickViewOpen(true); }}
                    isWishlisted={wishlist.includes(product.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <QuickView product={quickViewProduct} isOpen={isQuickViewOpen} onClose={() => setIsQuickViewOpen(false)} onToggleWishlist={handleToggleWishlist} isWishlisted={quickViewProduct ? wishlist.includes(quickViewProduct.id) : false} />
      </div>
    </div>
  );
};

export default ProductsPage;
