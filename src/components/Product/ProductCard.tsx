import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye, Zap, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatPrice } from '@/utils/currency';
import { useToast } from '@/hooks/use-toast';
import { WishlistButton } from './WishlistButton';
import { NewBadge, HotBadge, SaleBadge, LowStockBadge, TrendingBadge } from '@/components/Gamification/ProductBadges';
import { triggerAddToCartAnimation } from '@/components/Gamification/AddToCartAnimation';

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  sizes: string[];
  colors: string[];
  inStock: boolean;
  stock?: number;
  isNew?: boolean;
  isSale?: boolean;
  isHot?: boolean;
  isTrending?: boolean;
  rating?: number;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (productId: string) => void;
  onQuickView?: (product: Product) => void;
  isWishlisted: boolean;
}

const ProductCard = ({ product, onAddToCart, onToggleWishlist, onQuickView, isWishlisted }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdding(true);
    triggerAddToCartAnimation();
    onAddToCart(product);
    
    toast({
      title: "🛒 Added to Cart!",
      description: `${product.name} has been added to your cart`,
    });

    setTimeout(() => setIsAdding(false), 500);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerAddToCartAnimation();
    onAddToCart(product);
    toast({
      title: "⚡ Proceeding to Checkout",
      description: `${product.name} - Redirecting to payment...`,
    });
  };

  // Determine which badge to show
  const getBadge = () => {
    if (product.isSale && discountPercentage > 0) {
      return <SaleBadge discount={discountPercentage} />;
    }
    if (product.isHot) return <HotBadge />;
    if (product.isTrending) return <TrendingBadge />;
    if (product.isNew) return <NewBadge />;
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className="group cursor-pointer overflow-hidden border-border/50 bg-card hover:shadow-xl hover:shadow-primary/10 transition-all duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        tabIndex={0}
        role="article"
        aria-label={product.name}
      >
        <CardContent className="p-0">
          <div className="relative overflow-hidden">
            <motion.img
              src={product.image}
              alt={product.name}
              className="w-full h-48 sm:h-56 md:h-64 object-cover"
              animate={{ scale: isHovered ? 1.08 : 1 }}
              transition={{ duration: 0.4 }}
            />
            
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Product Badge */}
            {getBadge()}
            
            {/* Low stock warning */}
            {product.stock && product.stock > 0 && product.stock <= 5 && (
              <LowStockBadge stock={product.stock} />
            )}

            {/* Out of stock overlay */}
            {!product.inStock && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                <Badge variant="destructive" className="text-lg px-4 py-2">Sold Out</Badge>
              </div>
            )}

            {/* Rating badge */}
            {product.rating && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute bottom-2 right-2 z-10 flex items-center gap-1 bg-background/90 backdrop-blur-sm rounded-full px-2 py-1"
              >
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-medium">{product.rating.toFixed(1)}</span>
              </motion.div>
            )}

            {/* Action buttons */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="absolute top-3 right-3 flex flex-col gap-2"
                >
                  <WishlistButton productId={product.id} />
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-9 w-9 shadow-lg hover:shadow-xl bg-background/90 backdrop-blur-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuickView?.(product);
                    }}
                    aria-label="Quick view"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick action buttons */}
            <AnimatePresence>
              {isHovered && product.inStock && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute bottom-0 left-0 right-0 p-3 sm:p-4"
                >
                  <div className="space-y-2">
                    <Button
                      className="w-full text-sm h-10 shadow-lg hover:shadow-xl bg-gradient-to-r from-primary to-primary/80"
                      onClick={handleBuyNow}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Buy Now
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full bg-background/90 backdrop-blur-sm border-border/50 text-sm h-10"
                      onClick={handleAddToCart}
                    >
                      <motion.div
                        animate={isAdding ? { rotate: [0, -10, 10, 0] } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                      </motion.div>
                      Add to Cart
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-4 sm:p-5">
            <Link to={`/product/${product.id}`} className="block group/link">
              <h3 className="font-semibold text-base sm:text-lg text-foreground group-hover/link:text-primary transition-colors line-clamp-2 mb-2">
                {product.name}
              </h3>
            </Link>
            <p className="text-sm text-muted-foreground mb-3 truncate">{product.category}</p>
            
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <motion.span 
                className="font-bold text-lg text-primary"
                key={product.price}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
              >
                {formatPrice(product.price)}
              </motion.span>
              {product.originalPrice && (
                <>
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                  <Badge variant="secondary" className="text-2xs px-1.5 py-0.5 bg-green-500/10 text-green-600 dark:text-green-400">
                    Save {discountPercentage}%
                  </Badge>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-xs text-muted-foreground shrink-0 font-medium">Sizes:</span>
              <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
                {product.sizes.slice(0, 3).map((size) => (
                  <span key={size} className="text-xs bg-muted px-2 py-1 rounded-md shrink-0 font-medium hover:bg-primary/10 transition-colors">
                    {size}
                  </span>
                ))}
                {product.sizes.length > 3 && (
                  <span className="text-xs text-muted-foreground shrink-0 px-1">+{product.sizes.length - 3}</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProductCard;
