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
    { icon: Truck, title: 'Free Delivery', desc: 'On orders over KSh 5,000' },
    { icon: Shield, title: 'Secure Payments', desc: 'M-Pesa & card payments' },
    { icon: Headphones, title: 'Support 24/7', desc: 'Dedicated customer care' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero — editorial split layout */}
      <section className="relative overflow-hidden">
        <div className="absolute top-1/3 -left-32 w-[28rem] h-[28rem] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-32 w-[32rem] h-[32rem] bg-accent/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 pt-16 md:pt-24 lg:pt-32 pb-12 md:pb-20 relative z-10">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className="lg:col-span-7 max-w-2xl">
              <div className="inline-flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-8 animate-slide-up">
                <span className="h-px w-8 bg-foreground/40" />
                Kenya's Premier Marketplace
              </div>
              <h1
                className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] tracking-tight leading-[1.02] mb-8 animate-slide-up"
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, animationDelay: '0.1s' }}
              >
                Curated goods,<br />
                <em className="text-primary not-italic font-normal" style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}>delivered</em> with care.
              </h1>
              <p
                className="text-base md:text-lg text-muted-foreground mb-10 max-w-lg leading-relaxed animate-slide-up"
                style={{ animationDelay: '0.2s' }}
              >
                Discover premium products from verified Kenyan vendors. Instant M-Pesa checkout, doorstep delivery.
              </p>
              <div className="flex flex-wrap gap-3 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <Button size="lg" className="h-12 px-7 rounded-full text-sm tracking-wide shadow-md hover:shadow-lg transition-all" asChild>
                  <Link to="/products">
                    Shop the Collection <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="ghost" className="h-12 px-7 rounded-full text-sm tracking-wide hover:bg-muted" asChild>
                  <Link to="/stores">Explore Stores</Link>
                </Button>
              </div>
            </div>

            {/* Hero visual collage */}
            <div className="lg:col-span-5 relative animate-fade-in hidden lg:block" style={{ animationDelay: '0.4s' }}>
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80"
                  alt="Featured collection"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 via-transparent to-transparent" />
              </div>
              <div className="absolute -bottom-6 -left-6 w-40 aspect-square rounded-2xl overflow-hidden shadow-xl border-4 border-background hidden md:block">
                <img
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80"
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -top-4 -right-4 bg-card rounded-2xl shadow-xl px-4 py-3 flex items-center gap-2 border border-border/50">
                <Sparkles className="h-4 w-4 text-accent" />
                <span className="text-xs font-medium">30+ Premium Items</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip — minimal */}
      <section className="border-y border-border/40">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-4">
                <f.icon className="h-5 w-5 text-foreground/70 shrink-0" strokeWidth={1.5} />
                <div>
                  <h3 className="text-sm font-medium">{f.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-10 md:mb-12">
              <div>
                <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-3">Browse</p>
                <h2 className="text-3xl md:text-4xl tracking-tight" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
                  Shop by Category
                </h2>
              </div>
              <Button variant="ghost" size="sm" className="rounded-full hidden sm:inline-flex" asChild>
                <Link to="/products" className="text-xs tracking-wider uppercase text-muted-foreground hover:text-foreground">
                  View all <ArrowRight className="ml-1.5 h-3 w-3" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/category/${cat.slug}`}
                  className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted/40 transition-all hover:-translate-y-1 hover:shadow-elegant"
                >
                  {cat.image_url ? (
                    <img
                      src={cat.image_url}
                      alt={cat.name}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : null}
                  {/* Gradient overlay for text legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/75 via-foreground/20 to-transparent" />

                  {/* Icon chip top-left */}
                  <span className="absolute top-3 left-3 h-9 w-9 rounded-full bg-background/90 backdrop-blur-md flex items-center justify-center text-lg shadow-sm">
                    {cat.icon || '📦'}
                  </span>

                  {/* Label */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-background/70 mb-1">Shop</p>
                    <h3 className="text-base font-semibold text-background leading-tight">{cat.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10 md:mb-12">
            <div>
              <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-3">Editor's pick</p>
              <h2 className="text-3xl md:text-4xl tracking-tight" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
                Featured Products
              </h2>
            </div>
            <Button variant="ghost" size="sm" className="rounded-full hidden sm:inline-flex" asChild>
              <Link to="/products" className="text-xs tracking-wider uppercase text-muted-foreground hover:text-foreground">
                View all <ArrowRight className="ml-1.5 h-3 w-3" />
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10">
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
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10 md:mb-12">
            <div>
              <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-3">Just landed</p>
              <h2 className="text-3xl md:text-4xl tracking-tight" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}>
                New Arrivals
              </h2>
            </div>
            <Button variant="ghost" size="sm" className="rounded-full hidden sm:inline-flex" asChild>
              <Link to="/products" className="text-xs tracking-wider uppercase text-muted-foreground hover:text-foreground">
                View all <ArrowRight className="ml-1.5 h-3 w-3" />
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10">
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

      {/* CTA Banner — editorial */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="relative bg-foreground text-background rounded-3xl p-10 md:p-16 lg:p-20 overflow-hidden">
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-accent/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl">
              <p className="text-[11px] tracking-[0.25em] uppercase text-background/60 mb-5">For vendors</p>
              <h3
                className="text-3xl md:text-5xl lg:text-6xl tracking-tight leading-[1.05] mb-5"
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
              >
                Start selling on <em className="text-primary-glow not-italic" style={{ fontStyle: 'italic' }}>UrbanSoko</em>.
              </h3>
              <p className="text-background/70 text-base md:text-lg mb-8 max-w-lg leading-relaxed">
                Join thousands of vendors and reach customers across Kenya — with built-in M-Pesa, vendor analytics, and zero setup fees.
              </p>
              <Button size="lg" variant="secondary" className="rounded-full h-12 px-7 text-sm tracking-wide shadow-lg" asChild>
                <Link to="/vendor/register">Become a Vendor <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
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
