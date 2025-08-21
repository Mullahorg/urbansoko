import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Truck, Shield, RotateCcw, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import ProductCard from '@/components/Product/ProductCard';
import { products } from '@/data/products';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/utils/currency';
import { useToast } from '@/hooks/use-toast';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const product = products.find(p => p.id === id);
  
  useEffect(() => {
    if (product) {
      setSelectedColor(product.colors[0]);
      setSelectedSize(product.sizes[0]);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Button asChild>
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize && product.sizes.length > 0) {
      toast({
        title: "Please select a size",
        variant: "destructive"
      });
      return;
    }

    for (let i = 0; i < quantity; i++) {
      addToCart(product, selectedSize, selectedColor);
    }
  };

  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Mock additional images (in real app, these would come from product data)
  const productImages = [
    product.image,
    product.image, // Placeholder for additional angles
    product.image,
    product.image
  ];

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg bg-muted">
              <img
                src={productImages[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{product.category}</Badge>
                {product.isNew && <Badge className="bg-primary">New</Badge>}
                {product.isSale && <Badge className="bg-accent">Sale</Badge>}
              </div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">(127 reviews)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                  <Badge className="bg-accent">Save {discountPercentage}%</Badge>
                </>
              )}
            </div>

            <p className="text-muted-foreground">
              Embrace authentic African style with this premium {product.category.toLowerCase()}. 
              Crafted with attention to detail and designed for the modern man who appreciates 
              cultural heritage combined with contemporary fashion.
            </p>

            <Separator />

            {/* Options */}
            <div className="space-y-4">
              {product.colors.length > 1 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Color</label>
                  <div className="flex gap-2">
                    {product.colors.map(color => (
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

              {product.sizes.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Size</label>
                  <Select value={selectedSize} onValueChange={setSelectedSize}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {product.sizes.map(size => (
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
              <div className="flex gap-3">
                <Button 
                  className="flex-1" 
                  size="lg" 
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                >
                  <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
                </Button>
                <Button variant="outline" size="lg">
                  <Share className="h-4 w-4" />
                </Button>
              </div>

              {product.inStock && (
                <p className="text-sm text-green-600">✓ In stock and ready to ship</p>
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

        {/* Product Details Tabs */}
        <div className="mb-16">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="sizing">Size Guide</TabsTrigger>
              <TabsTrigger value="reviews">Reviews (127)</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Product Description</h3>
                  <div className="prose max-w-none">
                    <p>
                      This exquisite {product.name} represents the perfect fusion of traditional African 
                      aesthetics and contemporary fashion. Meticulously crafted using premium materials, 
                      this piece showcases authentic African patterns and motifs that celebrate the rich 
                      cultural heritage of the continent.
                    </p>
                    <h4 className="font-semibold mt-4 mb-2">Features:</h4>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Premium quality fabric with authentic African prints</li>
                      <li>Modern cut and tailoring for contemporary style</li>
                      <li>Breathable and comfortable for all-day wear</li>
                      <li>Machine washable with care instructions included</li>
                      <li>Ethically sourced and responsibly manufactured</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="sizing" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Size Guide</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-border">
                      <thead>
                        <tr className="bg-muted">
                          <th className="border border-border p-2 text-left">Size</th>
                          <th className="border border-border p-2 text-left">Chest (cm)</th>
                          <th className="border border-border p-2 text-left">Waist (cm)</th>
                          <th className="border border-border p-2 text-left">Length (cm)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td className="border border-border p-2">S</td><td className="border border-border p-2">88-92</td><td className="border border-border p-2">78-82</td><td className="border border-border p-2">68</td></tr>
                        <tr><td className="border border-border p-2">M</td><td className="border border-border p-2">96-100</td><td className="border border-border p-2">86-90</td><td className="border border-border p-2">70</td></tr>
                        <tr><td className="border border-border p-2">L</td><td className="border border-border p-2">104-108</td><td className="border border-border p-2">94-98</td><td className="border border-border p-2">72</td></tr>
                        <tr><td className="border border-border p-2">XL</td><td className="border border-border p-2">112-116</td><td className="border border-border p-2">102-106</td><td className="border border-border p-2">74</td></tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Customer Reviews</h3>
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="border-b pb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {[...Array(5)].map((_, j) => (
                              <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                            ))}
                          </div>
                          <span className="font-medium">James M.</span>
                          <span className="text-sm text-muted-foreground">2 days ago</span>
                        </div>
                        <p className="text-muted-foreground">
                          Excellent quality and perfect fit. The African print is beautiful and the fabric feels premium. 
                          Highly recommend!
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-8">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                  onAddToCart={addToCart}
                  onToggleWishlist={() => {}}
                  isWishlisted={false}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;