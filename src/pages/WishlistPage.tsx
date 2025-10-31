import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatKES } from '@/utils/currency';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

interface WishlistItem {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string;
    stock: number;
  };
}

const WishlistPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      fetchWishlist();
    }
  }, [user, authLoading, navigate]);

  const fetchWishlist = async () => {
    const { data, error } = await supabase
      .from('wishlist')
      .select('id, product:products(id, name, price, image_url, stock)')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setItems(data as any);
    }
    setLoading(false);
  };

  const removeFromWishlist = async (wishlistId: string) => {
    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('id', wishlistId);

    if (!error) {
      setItems(items.filter(item => item.id !== wishlistId));
      toast({ title: 'Removed from wishlist' });
    }
  };

  const moveToCart = (item: WishlistItem) => {
    addToCart(item.product as any);
    removeFromWishlist(item.id);
    toast({ title: 'Added to cart!' });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-48 w-full mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="w-8 h-8 text-destructive fill-destructive" />
        <h1 className="text-3xl font-bold">My Wishlist</h1>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Your wishlist is empty</h3>
            <p className="text-muted-foreground mb-4">Save your favorite items here!</p>
            <Button onClick={() => navigate('/')}>Start Shopping</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map(item => (
            <Card key={item.id} className="hover-scale">
              <CardContent className="p-4">
                <div className="relative mb-4">
                  <img
                    src={item.product.image_url || '/placeholder.svg'}
                    alt={item.product.name}
                    className="w-full h-48 object-cover rounded-md"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => removeFromWishlist(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <h3 className="font-semibold mb-2 line-clamp-2">{item.product.name}</h3>
                <p className="text-lg font-bold text-primary mb-3">
                  {formatKES(item.product.price)}
                </p>
                <Button
                  className="w-full"
                  onClick={() => moveToCart(item)}
                  disabled={item.product.stock <= 0}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {item.product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
