import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Truck, Shield, Headphones, Package, Award, Clock, Sparkles, Gift, Zap, Store, Hexagon, Cpu, Rocket, Globe, Scan, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ProductCard from '@/components/Product/ProductCard';
import QuickView from '@/components/Product/QuickView';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSiteContent } from '@/hooks/useSiteContent';
const iconMap: Record<string, React.ComponentType<any>> = {
  Truck,
  Shield,
  Headphones,
  Package,
  Award,
  Clock,
  Star,
  Store,
  Cpu,
  Rocket,
  Globe,
  Scan,
  Bot
};
const containerVariants = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};
const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20
  },
  visible: {
    opacity: 1,
    y: 0
  }
};
const Index = () => {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const {
    addToCart
  } = useCart();
  const {
    toast
  } = useToast();
  const {
    content,
    loading: contentLoading
  } = useSiteContent();
  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    try {
      const [productsResult, storesResult] = await Promise.all([supabase.from('products').select('*').order('created_at', {
        ascending: false
      }), supabase.from('stores').select('*').eq('status', 'active').order('rating', {
        ascending: false
      }).limit(6)]);
      if (productsResult.error) throw productsResult.error;
      if (storesResult.error) throw storesResult.error;
      setProducts(productsResult.data || []);
      setStores(storesResult.data || []);
    } catch (error: any) {
      toast({
        title: 'Error loading data',
        description: error.message,
        variant: 'destructive'
      });
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
  const getIcon = (iconName: string) => {
    return iconMap[iconName] || Cpu;
  };
  const futuristicFeatures = [{
    icon: Cpu,
    title: 'AI-Powered',
    description: 'Smart recommendations tailored to your style'
  }, {
    icon: Rocket,
    title: 'Express Delivery',
    description: 'Same-day delivery across Nairobi'
  }, {
    icon: Shield,
    title: 'Secure Payments',
    description: 'M-Pesa & card payments protected'
  }];
  return <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 lg:py-40 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 hex-pattern opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        
        <motion.div className="absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" animate={{
        scale: [1, 1.2, 1],
        opacity: [0.2, 0.4, 0.2]
      }} transition={{
        duration: 8,
        repeat: Infinity
      }} />
        <motion.div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl" animate={{
        scale: [1.2, 1, 1.2],
        opacity: [0.3, 0.2, 0.3]
      }} transition={{
        duration: 10,
        repeat: Infinity
      }} />
        <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-3xl" animate={{
        rotate: [0, 360]
      }} transition={{
        duration: 60,
        repeat: Infinity,
        ease: "linear"
      }} />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div className="max-w-5xl mx-auto text-center" initial="hidden" animate="visible" variants={containerVariants}>
            <motion.div variants={itemVariants} className="mb-6">
              <Badge className="bg-gradient-to-r from-primary via-secondary to-accent text-primary-foreground px-6 py-2 text-sm font-medium neon-glow">
                <Hexagon className="h-3 w-3 mr-2" />
                Next-Gen African Commerce
              </Badge>
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-8 leading-[0.9] tracking-tight">
              <span className="text-foreground">Shop the</span>
              <motion.span className="block text-gradient-cyber mt-2" animate={{
              backgroundPosition: ['0%', '100%', '0%']
            }} transition={{
              duration: 5,
              repeat: Infinity
            }}>
                Future Today
              </motion.span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">  Discover premium products from verified vendors with instant M-Pesa checkout.</motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center">
              <Button size="lg" className="w-full sm:w-auto text-base md:text-lg px-10 py-7 btn-cyber font-semibold group" asChild>
                <Link to="/stores">
                  <Store className="mr-2 h-5 w-5" />
                  Explore Stores
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base md:text-lg px-10 py-7 group border-primary/30 hover:border-primary hover:bg-primary/5" asChild>
                <Link to="/products">
                  <Scan className="mr-2 h-5 w-5" />
                  Browse Products
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div variants={itemVariants} className="mt-16 flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
              {futuristicFeatures.map((feature, index) => <motion.div key={index} className="flex items-center gap-2" whileHover={{
              scale: 1.05
            }}>
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-4 w-4 text-primary" />
                  </div>
                  <span>{feature.title}</span>
                </motion.div>)}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 md:py-28 bg-muted/20">
        <div className="container mx-auto px-4">
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8" initial="hidden" whileInView="visible" viewport={{
          once: true,
          margin: "-100px"
        }} variants={containerVariants}>
            {futuristicFeatures.map((feature, index) => <motion.div key={index} variants={itemVariants}>
                <Card className="card-cyber text-center border-none group cursor-pointer h-full">
                  <CardContent className="pt-10 pb-8 px-8">
                    <motion.div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent mb-6 group-hover:neon-glow transition-all" whileHover={{
                  rotate: [0, -5, 5, 0],
                  scale: 1.1
                }} transition={{
                  duration: 0.4
                }}>
                      <feature.icon className="h-10 w-10 text-primary" />
                    </motion.div>
                    <h3 className="font-bold text-xl mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>)}
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-16" initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }}>
            <Badge variant="outline" className="mb-4 border-primary/30">
              <Sparkles className="h-3 w-3 mr-1" />
              Curated Collection
            </Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Featured Products</h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover handpicked products from Africa's top vendors
            </p>
          </motion.div>
          
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8" initial="hidden" whileInView="visible" viewport={{
          once: true,
          margin: "-50px"
        }} variants={containerVariants}>
            {loading ? <div className="col-span-full text-center py-16 text-muted-foreground">
                <motion.div animate={{
              rotate: 360
            }} transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear"
            }} className="inline-block mb-4">
                  <Hexagon className="h-10 w-10 text-primary" />
                </motion.div>
                <p>Loading products...</p>
              </div> : featuredProducts.length === 0 ? <div className="col-span-full text-center py-16 text-muted-foreground">No featured products available</div> : featuredProducts.map((product, index) => <motion.div key={product.id} variants={itemVariants}>
                  <ProductCard product={{
              ...product,
              image: product.image_url || product.images?.[0],
              sizes: product.sizes || [],
              colors: product.colors || [],
              inStock: product.stock > 0,
              stock: product.stock,
              isNew: index < 2,
              isHot: index === 2,
              isTrending: index === 3
            }} onAddToCart={addToCart} onToggleWishlist={handleToggleWishlist} onQuickView={handleQuickView} isWishlisted={wishlist.includes(product.id)} />
                </motion.div>)}
          </motion.div>

          <motion.div className="text-center mt-16" initial={{
          opacity: 0
        }} whileInView={{
          opacity: 1
        }} viewport={{
          once: true
        }}>
            <Button size="lg" variant="outline" className="px-10 group border-primary/30 hover:border-primary" asChild>
              <Link to="/products">
                View All Products 
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent opacity-90" />
        <motion.div className="absolute inset-0 hex-pattern opacity-20" animate={{
        x: [0, 60],
        y: [0, 30]
      }} transition={{
        duration: 20,
        repeat: Infinity,
        ease: "linear"
      }} />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div className="flex flex-col md:flex-row items-center justify-between gap-8 text-primary-foreground" initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }}>
            <div className="text-center md:text-left">
              <motion.div animate={{
              rotate: [0, 10, -10, 0]
            }} transition={{
              duration: 3,
              repeat: Infinity
            }} className="inline-block mb-3">
                <Gift className="h-12 w-12" />
              </motion.div>
              <h3 className="text-3xl md:text-4xl font-bold mb-3">Get 15% Off Your First Order!</h3>
              <p className="text-primary-foreground/80 text-lg">Join UrbanSoko today and unlock exclusive member benefits</p>
            </div>
            <Button size="lg" variant="secondary" className="whitespace-nowrap px-10 py-6 text-lg font-semibold" asChild>
              <Link to="/auth">
                Join Now <Rocket className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-16 md:py-24 bg-muted/20">
        <div className="container mx-auto px-4">
          <motion.div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10" initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }}>
            <div>
              <Badge className="mb-3 bg-accent/10 text-accent border-accent/20">
                <Zap className="h-3 w-3 mr-1" />
                Just Dropped
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">New Arrivals</h2>
              <p className="text-muted-foreground">Fresh additions to our collection</p>
            </div>
            <Button variant="outline" className="group border-primary/30" asChild>
              <Link to="/category/new">
                View All 
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>

          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" initial="hidden" whileInView="visible" viewport={{
          once: true
        }} variants={containerVariants}>
            {loading ? <div className="col-span-full text-center py-12 text-muted-foreground">Loading products...</div> : newArrivals.length === 0 ? <div className="col-span-full text-center py-12 text-muted-foreground">No new arrivals available</div> : newArrivals.map(product => <motion.div key={product.id} variants={itemVariants}>
                  <ProductCard product={{
              ...product,
              image: product.image_url || product.images?.[0],
              sizes: product.sizes || [],
              colors: product.colors || [],
              inStock: product.stock > 0,
              stock: product.stock,
              isNew: true
            }} onAddToCart={addToCart} onToggleWishlist={handleToggleWishlist} onQuickView={handleQuickView} isWishlisted={wishlist.includes(product.id)} />
                </motion.div>)}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-12" initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }}>
            <Badge variant="outline" className="mb-4 border-primary/30">
              <Star className="h-3 w-3 mr-1 fill-current" />
              Customer Love
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join thousands of satisfied shoppers across Kenya
            </p>
          </motion.div>
          
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" initial="hidden" whileInView="visible" viewport={{
          once: true
        }} variants={containerVariants}>
            {[{
            name: "Sarah M.",
            location: "Nairobi",
            text: "UrbanSoko has completely changed how I shop online. The AI recommendations are spot on!"
          }, {
            name: "James K.",
            location: "Mombasa",
            text: "Fast delivery and amazing product quality. M-Pesa checkout makes everything seamless."
          }, {
            name: "Grace W.",
            location: "Kisumu",
            text: "Love the variety of products and the futuristic shopping experience. 5 stars!"
          }].map((testimonial, index) => <motion.div key={index} variants={itemVariants}>
                <Card className="card-cyber h-full">
                  <CardContent className="p-6">
                    <div className="flex mb-4">
                      {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-primary text-primary" />)}
                    </div>
                    <p className="text-muted-foreground mb-6 leading-relaxed">"{testimonial.text}"</p>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold">
                        {testimonial.name[0]}
                      </div>
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>)}
          </motion.div>
        </div>
      </section>

      <QuickView product={quickViewProduct} isOpen={isQuickViewOpen} onClose={() => setIsQuickViewOpen(false)} onToggleWishlist={handleToggleWishlist} isWishlisted={quickViewProduct ? wishlist.includes(quickViewProduct.id) : false} />
    </div>;
};
export default Index;