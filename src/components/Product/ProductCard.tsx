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
    <div className="group overflow-hidden rounded-2xl bg-card transition-all duration-500 hover:-translate-y-1">
      <div className="relative overflow-hidden rounded-2xl bg-muted/40">
        <Link to={`/product/${product.id}`}>
          <img
            src={product.image || '/placeholder.svg'}
            alt={product.name}
            className="w-full aspect-[4/5] object-cover group-hover:scale-[1.05] transition-transform duration-700 ease-out"
            loading="lazy"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg'; }}
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isNew && (
            <Badge className="text-[10px] tracking-wider uppercase px-2.5 py-1 bg-foreground text-background rounded-full font-medium border-0">
              New
            </Badge>
          )}
          {product.isSale && discountPercentage > 0 && (
            <Badge className="text-[10px] tracking-wider uppercase px-2.5 py-1 bg-destructive text-destructive-foreground rounded-full font-medium border-0">
              -{discountPercentage}%
            </Badge>
          )}
        </div>

        {!product.inStock && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center rounded-t-2xl">
            <span className="text-sm font-semibold text-muted-foreground bg-background/80 px-4 py-2 rounded-xl">Sold Out</span>
          </div>
        )}

        {/* Quick actions — wishlist always visible, quick view on hover */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          <WishlistButton productId={product.id} variant="ghost" />
          {onQuickView && (
            <Button
              size="icon"
              variant="secondary"
              className="h-9 w-9 rounded-full shadow-sm bg-card/90 backdrop-blur-md border-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              onClick={(e) => { e.stopPropagation(); onQuickView(product); }}
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {/* Add to cart on hover */}
        {product.inStock && (
          <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-all duration-400 translate-y-3 group-hover:translate-y-0">
            <Button
              size="sm"
              className="w-full h-10 text-xs tracking-wide uppercase rounded-full shadow-lg bg-foreground text-background hover:bg-foreground/90"
              onClick={handleAddToCart}
              disabled={isAdding}
            >
              <ShoppingCart className="h-3.5 w-3.5 mr-2" />
              Add to Cart
            </Button>
          </div>
        )}
      </div>

      <div className="pt-4 px-1 pb-1">
        <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-1.5">{product.category}</p>
        <Link to={`/product/${product.id}`}>
          <h3 className="text-[15px] font-medium leading-snug line-clamp-2 mb-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-end justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-base text-foreground">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
          {product.rating && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Star className="h-3 w-3 fill-accent text-accent" />
              <span className="text-[11px] font-medium">{product.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {product.stock !== undefined && product.stock > 0 && product.stock <= 5 && (
          <p className="text-[10px] text-destructive font-medium mt-2 tracking-wide uppercase">Only {product.stock} left</p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
