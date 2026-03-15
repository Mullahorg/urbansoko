import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, Headphones, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from '@/components/Product/ProductCard';
import QuickView from '@/components/Product/QuickView';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsResult, categoriesResult] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').eq('is_active', true).order('display_order', { ascending: true }).limit(8),
      ]);
      if (productsResult.error) throw productsResult.error;
      setProducts(productsResult.data || []);
      setCategories(categoriesResult.data || []);
    } catch (error: any) {
      toast({ title: 'Error loading data', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const featuredProducts = products.filter(p => p.featured).slice(0, 8);
  const newArrivals = products.slice(0, 4);

  const handleToggleWishlist = (productId: string) => {
    setWishlist(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
  };

  const handleQuickView = (product: any) => {
    setQuickViewProduct(product);
    setIsQuickViewOpen(true);
  };

  const features = [
    { icon: Truck, title: 'Free Delivery', desc: 'On orders over KSh 5,000', color: 'bg-primary/10 text-primary' },
    { icon: Shield, title: 'Secure Payments', desc: 'M-Pesa & card payments', color: 'bg-accent/10 text-accent' },
    { icon: Headphones, title: 'Support 24/7', desc: 'Dedicated customer care', color: 'bg-primary/10 text-primary' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative py-16 md:py-24 lg:py-32 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

        {/* Watermark logo */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <img src="/logo.png" alt="" className="w-56 md:w-80 lg:w-96 opacity-[0.03] dark:opacity-[0.04]" />
        </div>

        <div className="container mx-auto px-4 text-center max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-8 animate-slide-up">
            <Sparkles className="h-3.5 w-3.5" />
            Kenya's Premier Marketplace
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Quality products,<br />
            <span className="text-primary">delivered</span> to your door
          </h1>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s', fontFamily: "'DM Sans', sans-serif" }}>
            Discover premium products from verified vendors across Kenya with instant M-Pesa checkout.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <Button size="lg" className="h-12 px-8 rounded-xl shadow-md hover:shadow-lg transition-shadow" asChild>
              <Link to="/products">
                Browse Products <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 rounded-xl" asChild>
              <Link to="/stores">Explore Stores</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-border/50 bg-muted/30">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-4 p-5 bg-card rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                <div className={`h-12 w-12 rounded-xl ${f.color} flex items-center justify-center shrink-0`}>
                  <f.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>{f.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-14 md:py-20">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold">Shop by Category</h2>
              <Button variant="ghost" size="sm" className="rounded-xl" asChild>
                <Link to="/products" className="text-sm text-muted-foreground hover:text-foreground">
                  View all <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/category/${cat.slug}`}
                  className="group p-5 rounded-2xl border border-border/50 bg-card hover:border-primary/30 hover:shadow-md transition-all text-center"
                >
                  <span className="text-3xl block mb-3">{cat.icon || '📦'}</span>
                  <span className="text-sm font-medium group-hover:text-primary transition-colors" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-14 md:py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Featured Products</h2>
            <Button variant="ghost" size="sm" className="rounded-xl" asChild>
              <Link to="/products" className="text-sm text-muted-foreground hover:text-foreground">
                View all <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => (
                <Card key={i} className="rounded-2xl overflow-hidden">
                  <CardContent className="p-0">
                    <Skeleton className="h-56 w-full" />
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-16 bg-muted/30 rounded-2xl border border-dashed border-border">
              <p className="text-muted-foreground">No featured products available</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredProducts.map((product) => (
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
                  onQuickView={handleQuickView}
                  isWishlisted={wishlist.includes(product.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-14 md:py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">New Arrivals</h2>
            <Button variant="ghost" size="sm" className="rounded-xl" asChild>
              <Link to="/products" className="text-sm text-muted-foreground hover:text-foreground">
                View all <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => (
                <Card key={i} className="rounded-2xl overflow-hidden">
                  <CardContent className="p-0">
                    <Skeleton className="h-56 w-full" />
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {newArrivals.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    ...product,
                    image: product.image_url || product.images?.[0],
                    sizes: product.sizes || [],
                    colors: product.colors || [],
                    inStock: product.stock > 0,
                    stock: product.stock,
                    isNew: true,
                  }}
                  onAddToCart={addToCart}
                  onToggleWishlist={handleToggleWishlist}
                  onQuickView={handleQuickView}
                  isWishlisted={wishlist.includes(product.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="relative bg-primary text-primary-foreground rounded-3xl p-8 md:p-14 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
            {/* Decorative circle */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-white/5 rounded-full pointer-events-none" />
            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-bold mb-2">Start selling on UrbanSoko</h3>
              <p className="text-primary-foreground/80" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Join thousands of vendors and reach customers across Kenya.
              </p>
            </div>
            <Button size="lg" variant="secondary" className="shrink-0 rounded-xl shadow-md relative z-10" asChild>
              <Link to="/vendor/register">Become a Vendor</Link>
            </Button>
          </div>
        </div>
      </section>

      <QuickView
        product={quickViewProduct}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        onToggleWishlist={handleToggleWishlist}
        isWishlisted={quickViewProduct ? wishlist.includes(quickViewProduct.id) : false}
      />
    </div>
  );
};

export default Index;
