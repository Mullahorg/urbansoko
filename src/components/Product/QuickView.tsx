import { useState } from 'react';
import { X, Heart, ShoppingCart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Product } from './ProductCard';
import { formatPrice } from '@/utils/currency';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

interface QuickViewProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleWishlist: (productId: string) => void;
  isWishlisted: boolean;
}

const QuickView = ({ product, isOpen, onClose, onToggleWishlist, isWishlisted }: QuickViewProps) => {
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { toast } = useToast();

  if (!product) return null;

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
    onClose();
  };

  const handleBuyNow = () => {
    handleAddToCart();
    // In a real app, this would redirect to checkout
    toast({
      title: "Proceeding to Checkout",
      description: "Redirecting to M-Pesa payment..."
    });
  };

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto bg-card border border-border p-0">
        <DialogHeader className="sr-only">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 sm:right-4 sm:top-4 z-10 h-8 w-8 sm:h-10 sm:w-10"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 p-4 sm:p-6">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg bg-muted">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-4 sm:space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant="secondary" className="text-xs">{product.category}</Badge>
                {product.isNew && <Badge className="bg-primary text-xs">New</Badge>}
                {product.isSale && <Badge className="bg-accent text-xs">Sale</Badge>}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2">{product.name}</h2>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">(127 reviews)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <span className="text-xl sm:text-2xl font-bold text-primary">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <>
                  <span className="text-base sm:text-lg text-muted-foreground line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                  <Badge className="bg-accent text-xs">Save {discountPercentage}%</Badge>
                </>
              )}
            </div>

            <p className="text-sm sm:text-base text-muted-foreground">
              Embrace authentic African style with this premium {product.category.toLowerCase()}. 
              Crafted with attention to detail and designed for the modern man.
            </p>

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
                        className={`px-3 py-1 text-sm border rounded-md transition-colors ${
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

            {/* Actions */}
            <div className="space-y-2 sm:space-y-3">
              <div className="flex gap-2 sm:gap-3">
                <Button 
                  className="flex-1 text-xs sm:text-sm h-9 sm:h-11" 
                  onClick={handleBuyNow}
                  disabled={!product.inStock}
                >
                  <span className="hidden sm:inline">Buy Now - {formatPrice(product.price * quantity)}</span>
                  <span className="sm:hidden">Buy - {formatPrice(product.price * quantity)}</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onToggleWishlist(product.id)}
                  className="h-9 w-9 sm:h-11 sm:w-11"
                >
                  <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
                </Button>
              </div>

              <Button 
                variant="outline" 
                className="w-full text-xs sm:text-sm h-9 sm:h-11" 
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                <ShoppingCart className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Add to Cart
              </Button>

              {product.inStock ? (
                <p className="text-xs sm:text-sm text-green-600 text-center">✓ In stock and ready to ship</p>
              ) : (
                <p className="text-xs sm:text-sm text-red-600 text-center">Out of stock</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickView;