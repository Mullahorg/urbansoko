import { motion } from 'framer-motion';
import { Flame, Sparkles, Clock, TrendingUp, Percent, Star, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  className?: string;
}

export const NewBadge = ({ className }: BadgeProps) => (
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    className={cn(
      "absolute top-2 left-2 z-10 px-2 py-1 rounded-full text-xs font-bold",
      "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg",
      className
    )}
  >
    <span className="flex items-center gap-1">
      <Sparkles className="h-3 w-3" />
      NEW
    </span>
  </motion.div>
);

export const HotBadge = ({ className }: BadgeProps) => (
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    className={cn(
      "absolute top-2 left-2 z-10 px-2 py-1 rounded-full text-xs font-bold",
      "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg",
      className
    )}
  >
    <motion.span 
      className="flex items-center gap-1"
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ repeat: Infinity, duration: 1 }}
    >
      <Flame className="h-3 w-3" />
      HOT
    </motion.span>
  </motion.div>
);

export const SaleBadge = ({ discount, className }: BadgeProps & { discount: number }) => (
  <motion.div
    initial={{ scale: 0, rotate: -15 }}
    animate={{ scale: 1, rotate: -15 }}
    className={cn(
      "absolute top-2 right-2 z-10 px-2 py-1 rounded-lg text-xs font-bold",
      "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg",
      className
    )}
  >
    <span className="flex items-center gap-1">
      <Percent className="h-3 w-3" />
      {discount}% OFF
    </span>
  </motion.div>
);

export const LimitedBadge = ({ className }: BadgeProps) => (
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    className={cn(
      "absolute top-2 left-2 z-10 px-2 py-1 rounded-full text-xs font-bold",
      "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg",
      className
    )}
  >
    <motion.span 
      className="flex items-center gap-1"
      animate={{ opacity: [1, 0.5, 1] }}
      transition={{ repeat: Infinity, duration: 1.5 }}
    >
      <Clock className="h-3 w-3" />
      LIMITED
    </motion.span>
  </motion.div>
);

export const TrendingBadge = ({ className }: BadgeProps) => (
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    className={cn(
      "absolute top-2 left-2 z-10 px-2 py-1 rounded-full text-xs font-bold",
      "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg",
      className
    )}
  >
    <span className="flex items-center gap-1">
      <TrendingUp className="h-3 w-3" />
      TRENDING
    </span>
  </motion.div>
);

export const BestsellerBadge = ({ className }: BadgeProps) => (
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    className={cn(
      "absolute top-2 left-2 z-10 px-2 py-1 rounded-full text-xs font-bold",
      "bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg",
      className
    )}
  >
    <span className="flex items-center gap-1">
      <Star className="h-3 w-3 fill-current" />
      BESTSELLER
    </span>
  </motion.div>
);

export const LowStockBadge = ({ stock, className }: BadgeProps & { stock: number }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className={cn(
      "absolute bottom-2 left-2 z-10 px-2 py-1 rounded-full text-xs font-medium",
      "bg-red-500/90 text-white backdrop-blur-sm",
      className
    )}
  >
    <motion.span 
      className="flex items-center gap-1"
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ repeat: Infinity, duration: 2 }}
    >
      <AlertTriangle className="h-3 w-3" />
      Only {stock} left!
    </motion.span>
  </motion.div>
);
