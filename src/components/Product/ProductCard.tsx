import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
    <Card className="group overflow-hidden border-border hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-0">
        <div className="relative overflow-hidden">
          <Link to={`/product/${product.id}`}>
            <img
              src={product.image || '/placeholder.svg'}
              alt={product.name}
              className="w-full aspect-[3/4] object-cover group-hover:scale-[1.03] transition-transform duration-300"
              loading="lazy"
            />
          </Link>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.isNew && <Badge className="text-[10px] px-1.5 py-0.5 bg-foreground text-background">New</Badge>}
            {product.isSale && discountPercentage > 0 && (
              <Badge className="text-[10px] px-1.5 py-0.5 bg-destructive text-destructive-foreground">-{discountPercentage}%</Badge>
            )}
          </div>

          {!product.inStock && (
            <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
              <span className="text-sm font-medium text-muted-foreground">Sold Out</span>
            </div>
          )}

          {/* Quick actions */}
          <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <WishlistButton productId={product.id} variant="ghost" />
            {onQuickView && (
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8"
                onClick={(e) => { e.stopPropagation(); onQuickView(product); }}
              >
                <Eye className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          {/* Add to cart on hover */}
          {product.inStock && (
            <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                className="w-full h-8 text-xs"
                onClick={handleAddToCart}
                disabled={isAdding}
              >
                <ShoppingCart className="h-3 w-3 mr-1" />
                Add to Cart
              </Button>
            </div>
          )}

          {product.rating && (
            <div className="absolute bottom-2 right-2 flex items-center gap-0.5 bg-background/90 rounded-full px-1.5 py-0.5 opacity-100 group-hover:opacity-0 transition-opacity">
              <Star className="h-3 w-3 fill-foreground text-foreground" />
              <span className="text-[10px] font-medium">{product.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        <div className="p-3">
          <Link to={`/product/${product.id}`}>
            <h3 className="text-sm font-medium line-clamp-2 mb-1 hover:underline">{product.name}</h3>
          </Link>
          <p className="text-xs text-muted-foreground mb-2">{product.category}</p>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
            )}
          </div>

          {product.stock !== undefined && product.stock > 0 && product.stock <= 5 && (
            <p className="text-[10px] text-destructive mt-1">Only {product.stock} left</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
