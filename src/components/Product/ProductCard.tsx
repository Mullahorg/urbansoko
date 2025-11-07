import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatPrice } from '@/utils/currency';
import { useToast } from '@/hooks/use-toast';
import { WishlistButton } from './WishlistButton';

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
  isNew?: boolean;
  isSale?: boolean;
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
  const { toast } = useToast();

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    toast({
      title: "Proceeding to Checkout",
      description: `${product.name} - Redirecting to M-Pesa payment...`,
      className: "toast-success"
    });
  };

  return (
    <Card 
      className="group cursor-pointer card-interactive border-border/50 overflow-hidden focus-ring"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      tabIndex={0}
      role="article"
      aria-label={product.name}
    >
      <CardContent className="p-0">
        <div className="relative overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-48 sm:h-56 md:h-64 object-cover transition-transform duration-300 group-hover:scale-105 group-focus:scale-105"
            />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.isNew && (
              <Badge className="bg-primary text-primary-foreground">New</Badge>
            )}
            {product.isSale && (
              <Badge className="bg-accent text-accent-foreground">-{discountPercentage}%</Badge>
            )}
            {!product.inStock && (
              <Badge variant="destructive">Out of Stock</Badge>
            )}
          </div>

          {/* Action buttons */}
          <div className={`absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
          }`}>
            <WishlistButton productId={product.id} />
            <Button
              size="icon"
              variant="secondary"
              className="h-9 w-9 shadow-md hover:shadow-lg"
              onClick={(e) => {
                e.stopPropagation();
                onQuickView?.(product);
              }}
              aria-label="Quick view"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>

          {/* Quick action buttons */}
          <div className={`absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/95 via-black/80 to-transparent transition-all duration-300 ease-in-out ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}>
            <div className="space-y-2">
              <Button
                className="w-full text-sm h-10 shadow-lg hover:shadow-xl"
                onClick={handleBuyNow}
                disabled={!product.inStock}
              >
                <Zap className="h-4 w-4 mr-2" />
                Buy Now
              </Button>
              <Button
                variant="outline"
                className="w-full bg-white/10 border-white/30 text-white hover:bg-white/25 text-sm h-10"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(product);
                }}
                disabled={!product.inStock}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <Link to={`/product/${product.id}`} className="block group/link">
            <h3 className="font-semibold text-base sm:text-lg text-foreground group-hover/link:text-primary transition-colors line-clamp-2 mb-2">
              {product.name}
            </h3>
          </Link>
          <p className="text-sm text-muted-foreground mb-3 truncate">{product.category}</p>
          
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <span className="font-bold text-lg text-primary">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <>
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </span>
                <Badge variant="secondary" className="text-2xs px-1.5 py-0.5">
                  Save {discountPercentage}%
                </Badge>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-xs text-muted-foreground shrink-0 font-medium">Sizes:</span>
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
              {product.sizes.slice(0, 3).map((size) => (
                <span key={size} className="text-xs bg-muted px-2 py-1 rounded-md shrink-0 font-medium">
                  {size}
                </span>
              ))}
              {product.sizes.length > 3 && (
                <span className="text-xs text-muted-foreground shrink-0 px-1">+{product.sizes.length - 3} more</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;