import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { formatPrice } from '@/utils/currency';
import CartSheet from '@/components/Cart/CartSheet';
import { useGamificationSettings } from '@/hooks/useGamificationSettings';

const FloatingCartButton = () => {
  const { getTotalItems, getTotalPrice } = useCart();
  const isMobile = useIsMobile();
  
  const { data: settings } = useGamificationSettings();
  const floatingCartSettings = settings?.find(s => s.feature === 'floating_cart');
  const isEnabled = floatingCartSettings?.enabled ?? true;
  const showOnMobile = floatingCartSettings?.settings?.show_on_mobile ?? true;
  const showTotal = floatingCartSettings?.settings?.show_total ?? true;

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  // Only show on mobile when enabled and has items
  if (!isEnabled || !showOnMobile || !isMobile || totalItems === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-4 right-4 z-40"
      >
        <CartSheet
          trigger={
            <Button
              size="lg"
              className="rounded-full h-14 px-4 shadow-lg bg-primary hover:bg-primary/90 gap-2"
            >
              <div className="relative">
                <ShoppingCart className="h-5 w-5" />
                <motion.span
                  key={totalItems}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold"
                >
                  {totalItems}
                </motion.span>
              </div>
              {showTotal && (
                <span className="font-bold">{formatPrice(totalPrice)}</span>
              )}
            </Button>
          }
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default FloatingCartButton;
