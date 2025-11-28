import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Truck, Shield, Headphones, Package, Award, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ProductCard from '@/components/Product/ProductCard';
import QuickView from '@/components/Product/QuickView';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSiteContent } from '@/hooks/useSiteContent';

// Icon mapping for dynamic features
const iconMap: Record<string, React.ComponentType<any>> = {
  Truck,
  Shield,
  Headphones,
  Package,
  Award,
  Clock,
  Star
};

const Index = () => {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { content, loading: contentLoading } = useSiteContent();

  useEffect(() => {
    fetchProducts();
  }, []);

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

  const featuredProducts = products.filter(p => p.featured).slice(0, 8);
  const newArrivals = products.slice(0, 4);

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

  // Get icon component from string name
  const getIcon = (iconName: string) => {
    return iconMap[iconName] || Star;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10 py-16 md:py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utb3BhY2l0eT0iMC4wNSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {content.hero.badge && (
              <Badge className="mb-6 bg-accent text-accent-foreground animate-slide-in-down shadow-lg">
                {content.hero.badge}
              </Badge>
            )}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 md:mb-8 text-foreground leading-tight animate-fade-in">
              {content.hero.title?.split(' ').slice(0, 2).join(' ')}
              <span className="block mt-2 gradient-text"> {content.hero.title?.split(' ').slice(2).join(' ')}</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed animate-slide-in-up">
              {content.hero.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-stretch sm:items-center animate-scale-in">
              <Button size="lg" className="w-full sm:w-auto text-base md:text-lg px-8 py-6 shadow-lg hover:shadow-xl" asChild>
                <Link to={content.hero.ctaLink || '/products'}>
                  {content.hero.ctaText || 'Shop Now'} <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              {content.hero.secondaryCtaText && (
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base md:text-lg px-8 py-6" asChild>
                  <Link to={content.hero.secondaryCtaLink || '/products'}>{content.hero.secondaryCtaText}</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {content.features?.map((feature, index) => {
              const IconComponent = getIcon(feature.icon);
              return (
                <Card key={index} className="text-center card-interactive border-none shadow-md hover:shadow-xl">
                  <CardContent className="pt-8 pb-6 px-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                      <IconComponent className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <Badge variant="outline" className="mb-4">Our Collection</Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">Featured Products</h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Discover our handpicked selection of the finest African-inspired menswear
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {loading ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">Loading products...</div>
            ) : featuredProducts.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">No featured products available</div>
            ) : (
              featuredProducts.map((product, index) => (
                <div key={product.id} className={`animate-fade-in stagger-${(index % 4) + 1}`}>
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
                    onQuickView={handleQuickView}
                    isWishlisted={wishlist.includes(product.id)}
                  />
                </div>
              ))
            )}
          </div>

          <div className="text-center mt-12 md:mt-16">
            <Button size="lg" variant="outline" className="px-8" asChild>
              <Link to="/products">
                View All Products <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 md:mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">New Arrivals</h2>
              <p className="text-muted-foreground">Latest additions to our collection</p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/category/new">View All <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {loading ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">Loading products...</div>
            ) : newArrivals.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">No new arrivals available</div>
            ) : (
              newArrivals.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    ...product,
                    image: product.image_url || product.images?.[0],
                    sizes: product.sizes || [],
                    colors: product.colors || [],
                    inStock: product.stock > 0,
                  }}
                  onAddToCart={addToCart}
                  onToggleWishlist={handleToggleWishlist}
                  onQuickView={handleQuickView}
                  isWishlisted={wishlist.includes(product.id)}
                />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 md:py-16 testimonials-section">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">What Our Customers Say</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {content.testimonials?.map((testimonial, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating || 5)].map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-current text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">
                    "{testimonial.comment}"
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-semibold">{testimonial.initials}</span>
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick View Modal */}
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
