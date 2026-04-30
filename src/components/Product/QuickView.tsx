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

  const handleAddToCart = (closeAfter = true) => {
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
    toast({ title: 'Added to cart', description: `${quantity}× ${product.name}` });
    if (closeAfter) onClose();
  };

  const handleBuyNow = () => {
    handleAddToCart(true);
    toast({
      title: "Proceeding to Checkout",
      description: "Redirecting to M-Pesa payment..."
    });
  };

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const stockLevel = product.stock ?? 0;
  const lowStock = stockLevel > 0 && stockLevel <= 5;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] sm:w-full max-h-[92vh] overflow-y-auto bg-card border border-border/50 p-0 rounded-3xl">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 p-5 sm:p-8">
          {/* Product Image */}
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="aspect-square overflow-hidden rounded-2xl bg-muted/40">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg'; }}
              />
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div 
            className="space-y-5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2">{product.category}</p>
              <h2 className="text-2xl sm:text-3xl font-semibold leading-tight mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>{product.name}</h2>
              <div className="flex items-center gap-3 mb-1">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-accent text-accent" />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">127 reviews</span>
                {(product.isNew || product.isSale) && (
                  <span className="ml-auto flex gap-1.5">
                    {product.isNew && <Badge className="bg-foreground text-background text-[10px] uppercase tracking-wider rounded-full px-2 py-0.5 border-0">New</Badge>}
                    {product.isSale && <Badge className="bg-destructive text-destructive-foreground text-[10px] uppercase tracking-wider rounded-full px-2 py-0.5 border-0">Sale</Badge>}
                  </span>
                )}
              </div>
            </div>

            {/* Dynamic Price */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-3 flex-wrap">
                <motion.span 
                  className="text-3xl sm:text-4xl font-semibold text-foreground"
                  key={totalPrice}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                >
                  {formatPrice(totalPrice)}
                </motion.span>
                {product.originalPrice && quantity === 1 && !hasCustomizations && (
                  <>
                    <span className="text-base text-muted-foreground line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                    <Badge className="bg-destructive/10 text-destructive border-0 text-[10px] uppercase tracking-wider">Save {discountPercentage}%</Badge>
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

            <p className="text-sm text-muted-foreground leading-relaxed">
              Premium {product.category.toLowerCase()} crafted with attention to detail for the modern lifestyle.
            </p>

            <Separator className="bg-border/60" />

            {/* Variant Selector */}
            {variantGroups.length > 0 && (
              <VariantSelector
                groups={variantGroups}
                selectedAttributes={selectedAttributes}
                onAttributeChange={handleAttributeChange}
                showStock={false}
              />
            )}

            {/* Stock + Quantity row */}
            <div className="flex items-end justify-between gap-4">
              <div>
                <label className="text-[11px] tracking-[0.15em] uppercase text-muted-foreground mb-2 block">Quantity</label>
                <Select value={quantity.toString()} onValueChange={(value) => setQuantity(parseInt(value))}>
                  <SelectTrigger className="w-24 h-10 rounded-full bg-muted/40 border-border/60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(num => (
                      <SelectItem key={num} value={num.toString()} disabled={num > stockLevel}>{num}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="text-right">
                <p className="text-[11px] tracking-[0.15em] uppercase text-muted-foreground mb-1">Availability</p>
                {product.inStock ? (
                  <p className={`text-sm font-medium flex items-center justify-end gap-1.5 ${lowStock ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${lowStock ? 'bg-destructive' : 'bg-emerald-500'} animate-pulse`} />
                    {lowStock ? `Only ${stockLevel} left` : `In stock${stockLevel ? ` · ${stockLevel}` : ''}`}
                  </p>
                ) : (
                  <p className="text-sm font-medium text-destructive">Out of stock</p>
                )}
              </div>
            </div>

            {/* Custom Options (simplified for quick view) */}
            {customOptions.length > 0 && (
              <>
                <Separator className="bg-border/60" />
                <CustomOptionsSelector
                  options={customOptions.slice(0, 2)} // Show only first 2 options in quick view
                  selectedOptions={selectedCustomOptions}
                  onOptionChange={handleCustomOptionChange}
                />
              </>
            )}

            <Separator className="bg-border/60" />

            {/* Actions */}
            <div className="space-y-3">
              <div className="flex gap-3">
                <Button
                  className="flex-1 h-12 rounded-full text-sm tracking-wide bg-foreground text-background hover:bg-foreground/90"
                  onClick={() => handleAddToCart(false)}
                  disabled={!product.inStock}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart · {formatPrice(totalPrice)}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onToggleWishlist(product.id)}
                  className="h-12 w-12 rounded-full border-border/60 shrink-0"
                  aria-label="Toggle wishlist"
                >
                  <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-destructive text-destructive' : ''}`} />
                </Button>
              </div>

              <Button
                variant="ghost"
                className="w-full h-11 rounded-full text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground"
                onClick={handleBuyNow}
                disabled={!product.inStock}
              >
                <Zap className="mr-2 h-3.5 w-3.5" />
                Buy Now & Checkout
              </Button>
            </div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickView;
