import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface WishlistButtonProps {
  productId: string;
  variant?: 'default' | 'ghost';
}

export const WishlistButton = ({ productId, variant = 'ghost' }: WishlistButtonProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkWishlist();
    }
  }, [user, productId]);

  const checkWishlist = async () => {
    const { data } = await supabase
      .from('wishlist')
      .select('id')
      .eq('product_id', productId)
      .single();

    setIsInWishlist(!!data);
  };

  const toggleWishlist = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setLoading(true);

    try {
      if (isInWishlist) {
        const { error } = await supabase
          .from('wishlist')
          .delete()
          .eq('product_id', productId);

        if (!error) {
          setIsInWishlist(false);
          toast({ title: 'Removed from wishlist' });
        }
      } else {
        const { error } = await supabase
          .from('wishlist')
          .insert({ product_id: productId, user_id: user.id });

        if (!error) {
          setIsInWishlist(true);
          toast({ title: 'Added to wishlist!' });
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update wishlist',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size="icon"
      onClick={toggleWishlist}
      disabled={loading}
      className="relative"
    >
      <Heart
        className={`h-5 w-5 ${isInWishlist ? 'fill-destructive text-destructive' : ''}`}
      />
    </Button>
  );
};
