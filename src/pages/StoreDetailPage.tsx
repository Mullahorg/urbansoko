import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, MapPin, Truck, Clock, Phone, Mail, Share2, Heart, Store as StoreIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from '@/components/Product/ProductCard';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Store {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  logo_url: string | null;
  banner_url: string | null;
  rating: number | null;
  status: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  delivery_enabled: boolean | null;
  pickup_enabled: boolean | null;
  min_order_amount: number | null;
  delivery_fee: number | null;
}

interface Section {
  id: string;
  title: string;
  type: string | null;
  description: string | null;
  display_order: number | null;
  is_active: boolean | null;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  images: string[] | null;
  stock: number | null;
  sizes: string[] | null;
  colors: string[] | null;
  featured: boolean | null;
  section_id: string | null;
}

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

const StoreDetailPage = () => {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const [store, setStore] = useState<Store | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string>('all');
  const [wishlist, setWishlist] = useState<string[]>([]);
  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    if (storeSlug) {
      fetchStoreData();
    }
  }, [storeSlug]);

  const fetchStoreData = async () => {
    try {
      // Fetch store
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('*')
        .eq('slug', storeSlug)
        .single();

      if (storeError) throw storeError;
      setStore(storeData);

      // Fetch sections
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('store_sections')
        .select('*')
        .eq('store_id', storeData.id)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (sectionsError) throw sectionsError;
      setSections(sectionsData || []);

      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', storeData.id)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;
      setProducts(productsData || []);
    } catch (error: any) {
      toast({
        title: 'Error loading store',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = activeSection === 'all'
    ? products
    : products.filter(p => p.section_id === activeSection);

  const handleToggleWishlist = (productId: string) => {
    setWishlist(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: store?.name,
          text: store?.description || 'Check out this store on UrbanSoko',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link copied!',
        description: 'Store link copied to clipboard',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Skeleton className="h-64 w-full" />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-4 w-full max-w-2xl mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-80 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <StoreIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Store not found</h2>
          <p className="text-muted-foreground mb-4">This store doesn't exist or is no longer available.</p>
          <Button asChild>
            <Link to="/stores">Browse Stores</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Banner */}
      <div className="relative h-48 md:h-64 bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
        {store.banner_url ? (
          <img
            src={store.banner_url}
            alt={store.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary opacity-20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm"
          asChild
        >
          <Link to="/stores">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>

        {/* Share button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm"
          onClick={handleShare}
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Store Info */}
      <div className="container mx-auto px-4 -mt-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Logo */}
                <div className="w-24 h-24 rounded-xl bg-muted overflow-hidden flex-shrink-0 border-2 border-border">
                  {store.logo_url ? (
                    <img
                      src={store.logo_url}
                      alt={store.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <StoreIcon className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {store.category && (
                      <Badge variant="secondary">{store.category}</Badge>
                    )}
                    {store.rating && store.rating > 0 && (
                      <Badge className="bg-secondary/20 text-secondary">
                        <Star className="h-3 w-3 fill-current mr-1" />
                        {store.rating.toFixed(1)}
                      </Badge>
                    )}
                  </div>

                  <h1 className="text-2xl md:text-3xl font-bold mb-2">{store.name}</h1>
                  
                  {store.description && (
                    <p className="text-muted-foreground mb-4">{store.description}</p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {store.delivery_enabled && (
                      <div className="flex items-center gap-1">
                        <Truck className="h-4 w-4 text-accent" />
                        <span>Delivery Available</span>
                        {store.delivery_fee !== null && store.delivery_fee > 0 && (
                          <span className="text-foreground font-medium">
                            (KES {store.delivery_fee})
                          </span>
                        )}
                      </div>
                    )}
                    {store.pickup_enabled && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-accent" />
                        <span>Pickup Available</span>
                      </div>
                    )}
                    {store.phone && (
                      <a href={`tel:${store.phone}`} className="flex items-center gap-1 hover:text-primary">
                        <Phone className="h-4 w-4" />
                        <span>{store.phone}</span>
                      </a>
                    )}
                  </div>

                  {store.min_order_amount !== null && store.min_order_amount > 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Minimum order: <span className="text-foreground font-medium">KES {store.min_order_amount.toLocaleString()}</span>
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Products Section */}
      <div className="container mx-auto px-4 py-8">
        {/* Section Tabs */}
        {sections.length > 0 && (
          <Tabs value={activeSection} onValueChange={setActiveSection} className="mb-8">
            <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground"
              >
                All Products
              </TabsTrigger>
              {sections.map((section) => (
                <TabsTrigger
                  key={section.id}
                  value={section.id}
                  className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground"
                >
                  {section.title}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <StoreIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No products yet</h3>
            <p className="text-muted-foreground">
              This store hasn't added any products to this section yet.
            </p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {filteredProducts.map((product) => (
              <motion.div key={product.id} variants={itemVariants}>
                <ProductCard
                  product={{
                    ...product,
                    category: 'Products',
                    image: product.image_url || product.images?.[0],
                    sizes: product.sizes || [],
                    colors: product.colors || [],
                    inStock: (product.stock || 0) > 0,
                    stock: product.stock || 0,
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
    </div>
  );
};

export default StoreDetailPage;
