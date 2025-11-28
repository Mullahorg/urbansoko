import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface FlashSaleBannerProps {
  endTime?: Date;
  discount?: number;
  show?: boolean;
}

const FlashSaleBanner = ({ 
  endTime = new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
  discount = 20,
  show = true
}: FlashSaleBannerProps) => {
  const [isVisible, setIsVisible] = useState(show);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = endTime.getTime() - Date.now();
      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="bg-gradient-to-r from-red-600 via-orange-500 to-red-600 text-white py-2 px-4 relative overflow-hidden"
      >
        {/* Animated background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
        />

        <div className="container mx-auto flex items-center justify-center gap-4 relative z-10">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 0.5 }}
          >
            <Zap className="h-5 w-5 fill-yellow-300 text-yellow-300" />
          </motion.div>

          <span className="font-bold text-sm md:text-base">
            ⚡ FLASH SALE: {discount}% OFF Everything!
          </span>

          <div className="flex items-center gap-1 bg-black/20 rounded-lg px-3 py-1">
            <Clock className="h-4 w-4" />
            <span className="font-mono font-bold">
              {String(timeLeft.hours).padStart(2, '0')}:
              {String(timeLeft.minutes).padStart(2, '0')}:
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
          </div>

          <Link to="/products">
            <Button 
              size="sm" 
              variant="secondary"
              className="hidden md:inline-flex bg-white text-red-600 hover:bg-white/90 font-bold"
            >
              Shop Now
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-white/80 hover:text-white hover:bg-white/10"
            onClick={() => setIsVisible(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FlashSaleBanner;
