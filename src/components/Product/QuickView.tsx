import { useState, useMemo } from 'react';
import { X, Heart, ShoppingCart, Star, Zap, Gift } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Product } from './ProductCard';
import VariantSelector from './VariantSelector';
import CustomOptionsSelector from './CustomOptionsSelector';
import { formatPrice } from '@/utils/currency';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { useProductVariants } from '@/hooks/useProductVariants';

interface QuickViewProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleWishlist: (productId: string) => void;
  isWishlisted: boolean;
}

const QuickView = ({ product, isOpen, onClose, onToggleWishlist, isWishlisted }: QuickViewProps) => {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { toast } = useToast();

  // Use product variants hook
  const {
    variantGroups,
    customOptions,
    selectedAttributes,
    selectedCustomOptions,
    handleAttributeChange,
    handleCustomOptionChange,
    calculateTotalPrice,
  } = useProductVariants({ 
    productId: product?.id || '', 
    product: product 
  });

  if (!product) return null;

  // Calculate total price with customizations
  const totalPrice = calculateTotalPrice(product.price) * quantity;
  
  const hasCustomizations = Object.values(selectedCustomOptions).some(v => v && v !== '' && v !== false);

  const handleAddToCart = () => {
    // Validate required selections
    const requiredGroups = variantGroups.filter(g => g.required);
    const missingSelection = requiredGroups.find(g => !selectedAttributes[g.name]);
    
    if (missingSelection) {
      toast({
        title: `Please select a ${missingSelection.name}`,
        variant: "destructive"
      });
      return;
    }

    const selectedSize = selectedAttributes['Size'] || '';
    const selectedColor = selectedAttributes['Color'] || '';

    for (let i = 0; i < quantity; i++) {
      addToCart(product, selectedSize, selectedColor);
    }
    onClose();
  };

  const handleBuyNow = () => {
    handleAddToCart();
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
      <DialogContent className="max-w-4xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto bg-card border border-border/50 p-0">
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
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="aspect-square overflow-hidden rounded-xl bg-muted">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div 
            className="space-y-4 sm:space-y-5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant="secondary" className="text-xs">{product.category}</Badge>
                {product.isNew && <Badge className="bg-primary text-primary-foreground text-xs">New</Badge>}
                {product.isSale && <Badge className="bg-accent text-accent-foreground text-xs">Sale</Badge>}
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

            {/* Dynamic Price */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <motion.span 
                  className="text-xl sm:text-2xl font-bold text-gradient-primary"
                  key={totalPrice}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                >
                  {formatPrice(totalPrice)}
                </motion.span>
                {product.originalPrice && quantity === 1 && !hasCustomizations && (
                  <>
                    <span className="text-base sm:text-lg text-muted-foreground line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                    <Badge className="bg-accent/10 text-accent text-xs">Save {discountPercentage}%</Badge>
                  </>
                )}
              </div>
              
              {hasCustomizations && (
                <p className="text-xs text-primary flex items-center gap-1">
                  <Gift className="h-3 w-3" />
                  Includes customizations
                </p>
              )}
            </div>

            <p className="text-sm sm:text-base text-muted-foreground">
              Premium {product.category.toLowerCase()} crafted with attention to detail for the modern lifestyle.
            </p>

            <Separator className="bg-border/50" />

            {/* Variant Selector */}
            {variantGroups.length > 0 && (
              <VariantSelector
                groups={variantGroups}
                selectedAttributes={selectedAttributes}
                onAttributeChange={handleAttributeChange}
                showStock={false}
              />
            )}

            {/* Quantity */}
            <div>
              <label className="text-sm font-medium mb-2 block">Quantity</label>
              <Select value={quantity.toString()} onValueChange={(value) => setQuantity(parseInt(value))}>
                <SelectTrigger className="w-20 bg-muted/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map(num => (
                    <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custom Options (simplified for quick view) */}
            {customOptions.length > 0 && (
              <>
                <Separator className="bg-border/50" />
                <CustomOptionsSelector
                  options={customOptions.slice(0, 2)} // Show only first 2 options in quick view
                  selectedOptions={selectedCustomOptions}
                  onOptionChange={handleCustomOptionChange}
                />
              </>
            )}

            <Separator className="bg-border/50" />

            {/* Actions */}
            <div className="space-y-2 sm:space-y-3">
              <div className="flex gap-2 sm:gap-3">
                <Button 
                  className="flex-1 text-xs sm:text-sm h-10 sm:h-12 btn-cyber" 
                  onClick={handleBuyNow}
                  disabled={!product.inStock}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Buy Now - {formatPrice(totalPrice)}</span>
                  <span className="sm:hidden">Buy - {formatPrice(totalPrice)}</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onToggleWishlist(product.id)}
                  className="h-10 w-10 sm:h-12 sm:w-12 border-primary/30"
                >
                  <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current text-accent' : ''}`} />
                </Button>
              </div>

              <Button 
                variant="outline" 
                className="w-full text-xs sm:text-sm h-10 sm:h-11 border-primary/30 hover:border-primary" 
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                <ShoppingCart className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Add to Cart
              </Button>

              {product.inStock ? (
                <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 text-center flex items-center justify-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  In stock and ready to ship
                </p>
              ) : (
                <p className="text-xs sm:text-sm text-destructive text-center">Out of stock</p>
              )}
            </div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickView;
