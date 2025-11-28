import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Truck, Shield, Headphones, Package, Award, Clock, Sparkles, Gift, Zap } from 'lucide-react';
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
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
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }}
            transition={{ duration: 10, repeat: Infinity }}
          />
        </div>
        
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utb3BhY2l0eT0iMC4wNSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {content.hero.badge && (
              <motion.div variants={itemVariants}>
                <Badge className="mb-6 bg-gradient-to-r from-accent to-primary text-white animate-pulse-glow shadow-lg px-4 py-1.5">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {content.hero.badge}
                </Badge>
              </motion.div>
            )}
            
            <motion.h1 
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 md:mb-8 text-foreground leading-tight"
            >
              {content.hero.title?.split(' ').slice(0, 2).join(' ')}
              <motion.span 
                className="block mt-2 gradient-text"
                animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
                transition={{ duration: 5, repeat: Infinity }}
              >
                {content.hero.title?.split(' ').slice(2).join(' ')}
              </motion.span>
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              {content.hero.subtitle}
            </motion.p>
            
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-stretch sm:items-center"
            >
              <Button 
                size="lg" 
                className="w-full sm:w-auto text-base md:text-lg px-8 py-6 shadow-lg hover:shadow-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 group" 
                asChild
              >
                <Link to={content.hero.ctaLink || '/products'}>
                  <Zap className="mr-2 h-5 w-5 group-hover:animate-bounce-gentle" />
                  {content.hero.ctaText || 'Shop Now'} 
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              {content.hero.secondaryCtaText && (
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base md:text-lg px-8 py-6 group" asChild>
                  <Link to={content.hero.secondaryCtaLink || '/products'}>
                    {content.hero.secondaryCtaText}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              )}
            </motion.div>

            {/* Trust badges */}
            <motion.div 
              variants={itemVariants}
              className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" />
                <span>Free Shipping</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span>Secure Payment</span>
              </div>
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-primary" />
                <span>Easy Returns</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            {content.features?.map((feature, index) => {
              const IconComponent = getIcon(feature.icon);
              return (
                <motion.div key={index} variants={itemVariants}>
                  <Card className="text-center border-none shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer overflow-hidden">
                    <CardContent className="pt-8 pb-6 px-6 relative">
                      <motion.div 
                        className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mb-6 group-hover:scale-110 transition-transform"
                        whileHover={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        <IconComponent className="h-8 w-8 text-primary" />
                      </motion.div>
                      <h3 className="font-semibold text-lg mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-12 md:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="outline" className="mb-4">
              <Sparkles className="h-3 w-3 mr-1" />
              Our Collection
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">Featured Products</h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Discover our handpicked selection of the finest African-inspired menswear
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={containerVariants}
          >
            {loading ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="inline-block"
                >
                  <Package className="h-8 w-8 text-primary" />
                </motion.div>
                <p className="mt-2">Loading products...</p>
              </div>
            ) : featuredProducts.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">No featured products available</div>
            ) : (
              featuredProducts.map((product, index) => (
                <motion.div key={product.id} variants={itemVariants}>
                  <ProductCard
                    product={{
                      ...product,
                      image: product.image_url || product.images?.[0],
                      sizes: product.sizes || [],
                      colors: product.colors || [],
                      inStock: product.stock > 0,
                      stock: product.stock,
                      isNew: index < 2,
                      isHot: index === 2,
                      isTrending: index === 3,
                    }}
                    onAddToCart={addToCart}
                    onToggleWishlist={handleToggleWishlist}
                    onQuickView={handleQuickView}
                    isWishlisted={wishlist.includes(product.id)}
                  />
                </motion.div>
              ))
            )}
          </motion.div>

          <motion.div 
            className="text-center mt-12 md:mt-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Button size="lg" variant="outline" className="px-8 group" asChild>
              <Link to="/products">
                View All Products 
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="py-12 bg-gradient-to-r from-primary via-primary/90 to-accent overflow-hidden relative">
        <motion.div
          className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-50"
          animate={{ x: [0, 40], y: [0, 40] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="flex flex-col md:flex-row items-center justify-between gap-6 text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="text-center md:text-left">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block mb-2"
              >
                <Gift className="h-10 w-10" />
              </motion.div>
              <h3 className="text-2xl md:text-3xl font-bold mb-2">Get 10% Off Your First Order!</h3>
              <p className="text-white/80">Sign up for our newsletter and receive exclusive deals</p>
            </div>
            <Button size="lg" variant="secondary" className="whitespace-nowrap" asChild>
              <Link to="/auth">
                Sign Up Now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div 
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 md:mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div>
              <Badge className="mb-2 bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                <Sparkles className="h-3 w-3 mr-1" />
                Just In
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">New Arrivals</h2>
              <p className="text-muted-foreground">Latest additions to our collection</p>
            </div>
            <Button variant="outline" className="group" asChild>
              <Link to="/category/new">
                View All 
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {loading ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">Loading products...</div>
            ) : newArrivals.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">No new arrivals available</div>
            ) : (
              newArrivals.map((product) => (
                <motion.div key={product.id} variants={itemVariants}>
                  <ProductCard
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
                </motion.div>
              ))
            )}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 md:py-16 testimonials-section">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-8 md:mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="outline" className="mb-4">
              <Star className="h-3 w-3 mr-1 fill-current" />
              Testimonials
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-muted-foreground">Join thousands of satisfied customers</p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {content.testimonials?.map((testimonial, i) => (
              <motion.div key={i} variants={itemVariants}>
                <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="pt-6">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating || 5)].map((_, j) => (
                        <motion.div
                          key={j}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: j * 0.1 }}
                        >
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        </motion.div>
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-4 italic">
                      "{testimonial.comment}"
                    </p>
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary/30 to-primary/10 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-semibold text-primary">{testimonial.initials}</span>
                      </div>
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
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
