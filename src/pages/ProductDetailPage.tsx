import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Truck, Shield, RotateCcw, Share, Zap, Ruler, ChevronLeft, ChevronRight, WifiOff, Cpu, Leaf, Sparkles, Package, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import ProductCard from '@/components/Product/ProductCard';
import QuickView from '@/components/Product/QuickView';
import ReviewSection from '@/components/Product/ReviewSection';
import { SizeGuideModal } from '@/components/Product/SizeGuideModal';
import { ShippingCalculator } from '@/components/Product/ShippingCalculator';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/utils/currency';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useIntegratedAnalytics } from '@/hooks/useIntegratedAnalytics';
import { useIntelligentProductUI, ProductUIConfig } from '@/hooks/useIntelligentProductUI';

// Intelligent badge component based on category
const IntelligentBadge = ({ config, product }: { config: ProductUIConfig; product: any }) => {
  const getBadgeIcon = () => {
    switch (config.badgeStyle) {
      case 'tech': return <Cpu className="h-3 w-3 mr-1" />;
      case 'fresh': return <Leaf className="h-3 w-3 mr-1" />;
      case 'fashion': return <Sparkles className="h-3 w-3 mr-1" />;
      default: return null;
    }
  };

  const getBadgeClass = () => {
    switch (config.badgeStyle) {
      case 'tech': return 'bg-gradient-to-r from-primary to-secondary text-primary-foreground neon-glow';
      case 'fresh': return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white';
      case 'fashion': return 'bg-gradient-to-r from-secondary to-accent text-secondary-foreground';
      default: return 'bg-primary text-primary-foreground';
    }
  };

  return (
    <motion.div 
      className="flex flex-wrap gap-2 mb-3"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Badge variant="secondary">{product.category}</Badge>
      {product.featured && (
        <Badge className={getBadgeClass()}>
          {getBadgeIcon()}
          {config.category === 'electronics' ? 'Tech Pick' : config.category === 'food' ? 'Fresh Pick' : 'Featured'}
        </Badge>
      )}
      {config.showFreshnessIndicator && (
        <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
          <Leaf className="h-3 w-3 mr-1" />
          Farm Fresh
        </Badge>
      )}
      {config.showWarranty && product.warranty && (
        <Badge variant="outline" className="border-primary/30">
          <Shield className="h-3 w-3 mr-1" />
          Warranty
        </Badge>
      )}
    </motion.div>
  );
};

// Intelligent feature highlights based on category
const IntelligentFeatures = ({ config }: { config: ProductUIConfig }) => {
  const features = [];

  if (config.category === 'electronics') {
    features.push(
      { icon: Shield, text: '1 Year Warranty' },
      { icon: Truck, text: 'Express Delivery' },
      { icon: RotateCcw, text: '14-day Returns' }
    );
  } else if (config.category === 'food') {
    features.push(
      { icon: Leaf, text: 'Fresh Guaranteed' },
      { icon: Clock, text: 'Same Day Delivery' },
      { icon: Package, text: 'Eco Packaging' }
    );
  } else if (config.category === 'fashion') {
    features.push(
      { icon: Ruler, text: 'Size Guide Available' },
      { icon: RotateCcw, text: '30-day Returns' },
      { icon: Sparkles, text: 'Authentic Products' }
    );
  } else {
    features.push(
      { icon: Truck, text: 'Free shipping over KSh 5,000' },
      { icon: Shield, text: 'Secure payment' },
      { icon: RotateCcw, text: '30-day returns' }
    );
  }

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      {features.map((feature, index) => (
        <div key={index} className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border/50">
          <feature.icon className="h-4 w-4 text-primary" />
          <span className="text-sm">{feature.text}</span>
        </div>
      ))}
    </motion.div>
  );
};

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isUsingOfflineData, setIsUsingOfflineData] = useState(false);
  const [cachedImageUrls, setCachedImageUrls] = useState<Record<string, string>>({});
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { 
    isOnline, 
    getCachedProductDetail, 
    cacheProductDetail, 
    getCachedImage,
    getOfflineProducts,
    preloadCategoryProducts 
  } = useOfflineSync();
  const { trackProductView, trackAddToCart, trackWishlistAction } = useIntegratedAnalytics();
  
  // Intelligent UI configuration
  const uiConfig = useIntelligentProductUI(product);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id, isOnline]);

  const fetchProduct = async () => {
    setLoading(true);
    
    if (isOnline) {
      try {
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (productError) throw productError;
        
        setProduct(productData);
        setIsUsingOfflineData(false);
        
        if (productData) {
          setSelectedColor(productData.colors?.[0] || '');
          setSelectedSize(productData.sizes?.[0] || '');

          trackProductView({
            id: productData.id,
            name: productData.name,
            category: productData.category,
            price: productData.price,
            image_url: productData.image_url,
            images: productData.images,
          });

          cacheProductDetail(productData);
          preloadCategoryProducts(productData.category);

          const { data: related } = await supabase
            .from('products')
            .select('*')
            .eq('category', productData.category)
            .neq('id', id)
            .limit(4);
          
          setRelatedProducts(related || []);
        }
      } catch (error: any) {
        toast({
          title: 'Error loading product',
          description: error.message,
          variant: 'destructive',
        });
        loadFromCache();
      }
    } else {
      loadFromCache();
    }
    
    setLoading(false);
  };

  const loadFromCache = async () => {
    if (!id) return;
    
    const cachedProduct = getCachedProductDetail(id);
    
    if (cachedProduct) {
      setProduct(cachedProduct);
      setIsUsingOfflineData(true);
      setSelectedColor(cachedProduct.colors?.[0] || '');
      setSelectedSize(cachedProduct.sizes?.[0] || '');
      
      const imageUrls: Record<string, string> = {};
      const allImages = [cachedProduct.image_url, ...(cachedProduct.images || [])].filter(Boolean);
      for (const url of allImages) {
        if (url) {
          const cachedUrl = await getCachedImage(url);
          imageUrls[url] = cachedUrl;
        }
      }
      setCachedImageUrls(imageUrls);
      
      const allProducts = getOfflineProducts();
      if (allProducts) {
        const related = allProducts
          .filter(p => p.category === cachedProduct.category && p.id !== id)
          .slice(0, 4);
        setRelatedProducts(related);
      }
      
      toast({
        title: "Viewing Offline",
        description: "This product is available from your cached data",
      });
    } else {
      toast({
        title: "Product Not Available Offline",
        description: "This product hasn't been cached. Browse products to cache them.",
        variant: "destructive",
      });
    }
  };

  const getDisplayImageUrl = (url: string) => {
    if (!url) return '';
    if (isOnline) return url;
    return cachedImageUrls[url] || url;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Package className="h-10 w-10 text-primary" />
        </motion.div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <WifiOff className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Product Not Available</h1>
          <p className="text-muted-foreground mb-4">
            {isOnline ? "Product not found" : "This product isn't cached for offline viewing"}
          </p>
          <Button asChild className="btn-cyber">
            <Link to="/products">Browse Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  const productImages = product.images?.length > 0 ? product.images : [product.image_url];
  const currentImageUrl = getDisplayImageUrl(productImages[selectedImage]);
  
  // Use intelligent config or defaults
  const config = uiConfig || {
    category: 'default',
    showSizeGuide: true,
    showColorPicker: true,
    primaryCTA: 'Buy Now',
    secondaryCTA: 'Add to Cart',
    badgeStyle: 'default' as const,
    priceDisplay: 'standard' as const,
    showNutritionInfo: false,
    showSpecifications: false,
    showWarranty: false,
    showIngredients: false,
    showMaterials: false,
    showDimensions: false,
    showCompatibility: false,
    showDeliveryEstimate: true,
    showFreshnessIndicator: false,
    imageLayout: 'gallery' as const,
    reviewFocus: 'rating' as const,
  };

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  const handleAddToCart = () => {
    if (!selectedSize && product.sizes?.length > 0 && config.showSizeGuide) {
      toast({
        title: "Please select a size",
        variant: "destructive"
      });
      return;
    }

    const productForCart = {
      ...product,
      image: product.image_url || product.images?.[0],
      inStock: product.stock > 0,
    };

    for (let i = 0; i < quantity; i++) {
      addToCart(productForCart, selectedSize, selectedColor);
    }

    trackAddToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      category: product.category,
    });
  };

  const handleBuyNow = () => {
    if (!selectedSize && product.sizes?.length > 0 && config.showSizeGuide) {
      toast({
        title: "Please select a size",
        variant: "destructive"
      });
      return;
    }

    handleAddToCart();
    toast({
      title: "Proceeding to Checkout",
      description: `${product.name} - Redirecting to checkout...`,
    });
  };

  const handleQuickView = (prod: any) => {
    setQuickViewProduct(prod);
    setIsQuickViewOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <motion.div 
          className="flex items-center gap-2 text-sm text-muted-foreground mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link to={`/category/${product.category.toLowerCase()}`} className="hover:text-primary capitalize transition-colors">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {/* Product Images */}
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted group card-cyber">
              {isUsingOfflineData && (
                <Badge variant="secondary" className="absolute top-3 left-3 z-10 flex items-center gap-1">
                  <WifiOff className="h-3 w-3" />
                  Offline
                </Badge>
              )}
              <motion.img
                key={selectedImage}
                src={currentImageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              />
              
              {productImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
            
            {productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {productImages.map((image: string, index: number) => (
                  <motion.button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === index ? 'border-primary neon-glow' : 'border-transparent hover:border-primary/50'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <img
                      src={getDisplayImageUrl(image)}
                      alt={`${product.name} view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info - Intelligent UI */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div>
              <IntelligentBadge config={config} product={product} />
              <h1 className="text-3xl md:text-4xl font-bold mb-3">{product.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">(Reviews)</span>
                </div>
              </div>
            </div>

            {/* Intelligent Price Display */}
            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-3xl font-bold text-gradient-primary">{formatPrice(product.price)}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-lg text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
                    <Badge className="bg-accent/10 text-accent border-accent/20">
                      Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                    </Badge>
                  </>
                )}
              </div>
              {config.priceDisplay === 'per-unit' && (
                <p className="text-sm text-muted-foreground">Price per unit</p>
              )}
            </motion.div>

            <p className="text-muted-foreground leading-relaxed">
              {product.description || `Premium ${product.category.toLowerCase()} - Experience exceptional quality with this carefully curated product.`}
            </p>

            <Separator className="bg-border/50" />

            {/* Options - Conditionally rendered based on category */}
            <div className="space-y-4">
              {config.showColorPicker && product.colors?.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <label className="text-sm font-medium mb-2 block">Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {product.colors.map((color: string) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 text-sm border rounded-lg transition-all ${
                          selectedColor === color 
                            ? 'border-primary bg-primary/10 text-primary' 
                            : 'border-border/50 hover:border-primary/50'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {config.showSizeGuide && product.sizes?.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Size</label>
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-primary"
                      onClick={() => setIsSizeGuideOpen(true)}
                    >
                      <Ruler className="h-3 w-3 mr-1" />
                      Size Guide
                    </Button>
                  </div>
                  <Select value={selectedSize} onValueChange={setSelectedSize}>
                    <SelectTrigger className="w-32 bg-muted/50">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {product.sizes.map((size: string) => (
                        <SelectItem key={size} value={size}>{size}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>
              )}

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <label className="text-sm font-medium mb-2 block">Quantity</label>
                <Select value={quantity.toString()} onValueChange={(value) => setQuantity(parseInt(value))}>
                  <SelectTrigger className="w-20 bg-muted/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 10].map(num => (
                      <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
            </div>

            <Separator className="bg-border/50" />

            {/* Intelligent CTA Buttons */}
            <motion.div 
              className="space-y-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button 
                className="w-full btn-cyber py-6 text-lg" 
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
              >
                <Zap className="mr-2 h-5 w-5" />
                {config.primaryCTA} - {formatPrice(product.price * quantity)}
              </Button>

              <div className="flex gap-3">
                <Button 
                  variant="outline"
                  className="flex-1 border-primary/30 hover:border-primary hover:bg-primary/5" 
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  size="lg"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {config.secondaryCTA}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  size="lg"
                  className="border-primary/30 hover:border-primary"
                >
                  <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current text-accent' : ''}`} />
                </Button>
                <Button variant="outline" size="lg" className="border-primary/30 hover:border-primary">
                  <Share className="h-4 w-4" />
                </Button>
              </div>

              {product.stock > 0 && (
                <p className="text-sm text-green-500 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  In stock ({product.stock} available)
                </p>
              )}
            </motion.div>

            <Separator className="bg-border/50" />

            {/* Intelligent Features */}
            <IntelligentFeatures config={config} />
          </motion.div>
        </div>

        {/* Tabs Section */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start border-b border-border/50 rounded-none bg-transparent p-0 h-auto">
              <TabsTrigger value="description" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                Description
              </TabsTrigger>
              {config.showSpecifications && (
                <TabsTrigger value="specs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                  Specifications
                </TabsTrigger>
              )}
              {config.showNutritionInfo && (
                <TabsTrigger value="nutrition" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                  Nutrition Info
                </TabsTrigger>
              )}
              <TabsTrigger value="reviews" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                Reviews
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="pt-6">
              <Card className="card-cyber">
                <CardContent className="p-6">
                  <p className="text-muted-foreground leading-relaxed">
                    {product.description || `Experience the perfect blend of style and quality with this ${product.category.toLowerCase()}. Carefully curated for the modern African consumer, this product represents the best of local craftsmanship and international standards.`}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            {config.showSpecifications && (
              <TabsContent value="specs" className="pt-6">
                <Card className="card-cyber">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <p className="text-sm text-muted-foreground">Category</p>
                        <p className="font-medium">{product.category}</p>
                      </div>
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <p className="text-sm text-muted-foreground">SKU</p>
                        <p className="font-medium">{product.id?.slice(0, 8).toUpperCase()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
            
            <TabsContent value="reviews" className="pt-6">
              <ReviewSection productId={product.id} />
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <motion.div 
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  product={{
                    ...relatedProduct,
                    image: relatedProduct.image_url || relatedProduct.images?.[0],
                    inStock: relatedProduct.stock > 0,
                  }}
                  onAddToCart={addToCart}
                  onToggleWishlist={() => {}}
                  onQuickView={handleQuickView}
                  isWishlisted={false}
                />
              ))}
            </div>
          </motion.div>
        )}

        <ShippingCalculator subtotal={product.price * quantity} />
        <SizeGuideModal isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />
        
        <QuickView
          product={quickViewProduct}
          isOpen={isQuickViewOpen}
          onClose={() => setIsQuickViewOpen(false)}
          onToggleWishlist={() => {}}
          isWishlisted={false}
        />
      </div>
    </div>
  );
};

export default ProductDetailPage;
