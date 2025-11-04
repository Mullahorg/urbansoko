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
      className="group cursor-pointer transition-all duration-300 hover:shadow-lg product-hover-glow animate-fade-in overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      tabIndex={0}
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
          <div className={`absolute top-2 right-2 flex flex-col gap-2 transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            <WishlistButton productId={product.id} />
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onQuickView?.(product);
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>

          {/* Quick action buttons */}
          <div className={`absolute bottom-0 left-0 right-0 p-2 sm:p-4 bg-gradient-to-t from-black/90 to-transparent transition-all duration-300 ease-in-out ${
            isHovered ? 'opacity-100 translate-y-0 animate-fade-in' : 'opacity-0 translate-y-2 pointer-events-none'
          }`}>
            <div className="space-y-1.5 sm:space-y-2">
              <Button
                className="w-full text-xs sm:text-sm h-8 sm:h-9"
                onClick={handleBuyNow}
                disabled={!product.inStock}
              >
                <Zap className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Buy Now
              </Button>
              <Button
                variant="outline"
                className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs sm:text-sm h-8 sm:h-9"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(product);
                }}
                disabled={!product.inStock}
              >
                <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-4">
          <Link to={`/product/${product.id}`} className="block">
            <h3 className="font-semibold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>
          <p className="text-xs sm:text-sm text-muted-foreground mb-2 truncate">{product.category}</p>
          
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm sm:text-base text-primary">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-xs sm:text-sm text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-2 overflow-hidden">
            <span className="text-xs text-muted-foreground shrink-0">Sizes:</span>
            <div className="flex gap-1 overflow-x-auto scrollbar-hide">
              {product.sizes.slice(0, 3).map((size) => (
                <span key={size} className="text-xs bg-muted px-1.5 py-0.5 rounded shrink-0">
                  {size}
                </span>
              ))}
              {product.sizes.length > 3 && (
                <span className="text-xs text-muted-foreground shrink-0">+{product.sizes.length - 3}</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;