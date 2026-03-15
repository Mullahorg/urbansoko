import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/utils/currency';
import { useToast } from '@/hooks/use-toast';
import { WishlistButton } from './WishlistButton';
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
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsAdding(true);
    triggerAddToCartAnimation();
    onAddToCart(product);
    toast({ title: "Added to cart", description: product.name });
    setTimeout(() => setIsAdding(false), 500);
  }, [onAddToCart, product, toast]);

  return (
    <div className="group overflow-hidden rounded-2xl border border-border/50 bg-card hover:shadow-lg transition-all duration-300">
      <div className="relative overflow-hidden">
        <Link to={`/product/${product.id}`}>
          <img
            src={product.image || '/placeholder.svg'}
            alt={product.name}
            className="w-full aspect-[3/4] object-cover group-hover:scale-[1.04] transition-transform duration-500"
            loading="lazy"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isNew && (
            <Badge className="text-[10px] px-2 py-0.5 bg-primary text-primary-foreground rounded-lg font-semibold shadow-sm">
              New
            </Badge>
          )}
          {product.isSale && discountPercentage > 0 && (
            <Badge className="text-[10px] px-2 py-0.5 bg-destructive text-destructive-foreground rounded-lg font-semibold shadow-sm">
              -{discountPercentage}%
            </Badge>
          )}
        </div>

        {!product.inStock && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center rounded-t-2xl">
            <span className="text-sm font-semibold text-muted-foreground bg-background/80 px-4 py-2 rounded-xl">Sold Out</span>
          </div>
        )}

        {/* Quick actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
          <WishlistButton productId={product.id} variant="ghost" />
          {onQuickView && (
            <Button
              size="icon"
              variant="secondary"
              className="h-9 w-9 rounded-xl shadow-sm bg-card/90 backdrop-blur-sm"
              onClick={(e) => { e.stopPropagation(); onQuickView(product); }}
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {/* Add to cart on hover */}
        {product.inStock && (
          <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <Button
              size="sm"
              className="w-full h-9 text-xs rounded-xl shadow-md"
              onClick={handleAddToCart}
              disabled={isAdding}
            >
              <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
              Add to Cart
            </Button>
          </div>
        )}

        {product.rating && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-card/90 backdrop-blur-sm rounded-lg px-2 py-1 shadow-sm opacity-100 group-hover:opacity-0 transition-opacity">
            <Star className="h-3 w-3 fill-accent text-accent" />
            <span className="text-[11px] font-semibold">{product.rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-sm font-semibold line-clamp-2 mb-1 hover:text-primary transition-colors" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-muted-foreground mb-2.5">{product.category}</p>

        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-foreground">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="text-xs text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
          )}
        </div>

        {product.stock !== undefined && product.stock > 0 && product.stock <= 5 && (
          <p className="text-[10px] text-destructive font-medium mt-1.5">Only {product.stock} left</p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
