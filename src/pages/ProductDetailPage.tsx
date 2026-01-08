import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Truck, Shield, RotateCcw, Share, Zap, Ruler, ChevronLeft, ChevronRight, WifiOff } from 'lucide-react';
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

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id, isOnline]);

  const fetchProduct = async () => {
    setLoading(true);
    
    // Try to fetch from network first
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

          // Track product view for analytics
          trackProductView({
            id: productData.id,
            name: productData.name,
            category: productData.category,
            price: productData.price,
            image_url: productData.image_url,
            images: productData.images,
          });

          // Cache this product for offline use
          cacheProductDetail(productData);

          // Preload related products for offline
          preloadCategoryProducts(productData.category);

          // Fetch related products
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
        // Try loading from cache on error
        loadFromCache();
      }
    } else {
      // Load from cache when offline
      loadFromCache();
    }
    
    setLoading(false);
  };

  const loadFromCache = async () => {
    if (!id) return;
    
    // Try to get cached product detail
    const cachedProduct = getCachedProductDetail(id);
    
    if (cachedProduct) {
      setProduct(cachedProduct);
      setIsUsingOfflineData(true);
      setSelectedColor(cachedProduct.colors?.[0] || '');
      setSelectedSize(cachedProduct.sizes?.[0] || '');
      
      // Get cached images
      const imageUrls: Record<string, string> = {};
      const allImages = [cachedProduct.image_url, ...(cachedProduct.images || [])].filter(Boolean);
      for (const url of allImages) {
        if (url) {
          const cachedUrl = await getCachedImage(url);
          imageUrls[url] = cachedUrl;
        }
      }
      setCachedImageUrls(imageUrls);
      
      // Get related products from offline cache
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
      // Product not in cache
      toast({
        title: "Product Not Available Offline",
        description: "This product hasn't been cached. Browse products to cache them.",
        variant: "destructive",
      });
    }
  };

  // Get the display URL for an image (cached or original)
  const getDisplayImageUrl = (url: string) => {
    if (!url) return '';
    if (isOnline) return url;
    return cachedImageUrls[url] || url;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <WifiOff className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Product Not Available</h1>
          <p className="text-muted-foreground mb-4">
            {isOnline ? "Product not found" : "This product isn't cached for offline viewing"}
          </p>
          <Button asChild>
            <Link to="/products">Browse Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  const productImages = product.images?.length > 0 ? product.images : [product.image_url];

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  // Get display image URL (cached for offline)
  const currentImageUrl = getDisplayImageUrl(productImages[selectedImage]);

  const handleAddToCart = () => {
    if (!selectedSize && product.sizes?.length > 0) {
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

    // Track add to cart for analytics
    trackAddToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      category: product.category,
    });
  };

  const handleBuyNow = () => {
    if (!selectedSize && product.sizes?.length > 0) {
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
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link to={`/category/${product.category.toLowerCase()}`} className="hover:text-primary capitalize">
            {product.category}
          </Link>
          <span>/</span>
          <span>{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-muted group">
              {isUsingOfflineData && (
                <Badge variant="secondary" className="absolute top-3 left-3 z-10 flex items-center gap-1">
                  <WifiOff className="h-3 w-3" />
                  Offline
                </Badge>
              )}
              <img
                src={currentImageUrl}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              
              {/* Image navigation arrows */}
              {productImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
            
            {/* Thumbnail grid */}
            {productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {productImages.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                      selectedImage === index ? 'border-primary shadow-md' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={getDisplayImageUrl(image)}
                      alt={`${product.name} view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{product.category}</Badge>
                {product.featured && <Badge className="bg-primary">Featured</Badge>}
              </div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">(Reviews)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
            </div>

            <p className="text-muted-foreground">
              {product.description || `Embrace authentic African style with this premium ${product.category.toLowerCase()}.`}
            </p>

            <Separator />

            {/* Options */}
            <div className="space-y-4">
              {product.colors?.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Color</label>
                  <div className="flex gap-2">
                    {product.colors.map((color: string) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-3 py-1 text-sm border rounded-md ${
                          selectedColor === color 
                            ? 'border-primary bg-primary text-primary-foreground' 
                            : 'border-border hover:border-primary'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product.sizes?.length > 0 && (
                <div>
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
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {product.sizes.map((size: string) => (
                        <SelectItem key={size} value={size}>{size}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <label className="text-sm font-medium mb-2 block">Quantity</label>
                <Select value={quantity.toString()} onValueChange={(value) => setQuantity(parseInt(value))}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(num => (
                      <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="space-y-3">
              <Button 
                className="w-full" 
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                size="lg"
              >
                <Zap className="mr-2 h-4 w-4" />
                Buy Now - {formatPrice(product.price * quantity)}
              </Button>

              <div className="flex gap-3">
                <Button 
                  variant="outline"
                  className="flex-1" 
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  size="lg"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  size="lg"
                >
                  <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
                </Button>
                <Button variant="outline" size="lg">
                  <Share className="h-4 w-4" />
                </Button>
              </div>

              {product.stock > 0 && (
                <p className="text-sm text-green-600">✓ In stock ({product.stock} available)</p>
              )}
            </div>

            <Separator />

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" />
                <span className="text-sm">Free shipping over KSh 5,000</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-sm">Secure payment</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-primary" />
                <span className="text-sm">30-day returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Related Products</h2>
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
          </div>
        )}

        <ReviewSection productId={product.id} />
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
