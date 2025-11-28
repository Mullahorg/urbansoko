import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';

interface FloatingCartButtonProps {
  onClick?: () => void;
  className?: string;
}

const FloatingCartButton = ({ onClick, className }: FloatingCartButtonProps) => {
  const { getTotalItems, getTotalPrice } = useCart();
  const itemCount = getTotalItems();

  if (itemCount === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className={cn(
          "fixed bottom-6 right-6 z-40 md:hidden",
          className
        )}
      >
        <Button
          onClick={onClick}
          size="lg"
          className="rounded-full h-16 w-16 shadow-2xl bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 relative overflow-hidden"
        >
          {/* Animated ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary-foreground/30"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
          
          <ShoppingCart className="h-6 w-6" />
          
          {/* Badge */}
          <motion.span
            key={itemCount}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center"
          >
            {itemCount}
          </motion.span>
        </Button>

        {/* Price tooltip */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-background border shadow-lg rounded-lg px-3 py-2 whitespace-nowrap"
        >
          <p className="text-xs text-muted-foreground">Cart Total</p>
          <p className="font-bold text-primary">KES {getTotalPrice().toLocaleString()}</p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FloatingCartButton;
