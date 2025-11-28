import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGamificationSettings } from '@/hooks/useGamificationSettings';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  const { data: settings } = useGamificationSettings();
  const scrollSettings = settings?.find(s => s.feature === 'scroll_to_top');
  const isEnabled = scrollSettings?.enabled ?? true;
  const showAfterScroll = scrollSettings?.settings?.show_after_scroll ?? 300;

  useEffect(() => {
    if (!isEnabled) return;

    const toggleVisibility = () => {
      setIsVisible(window.scrollY > showAfterScroll);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, [isEnabled, showAfterScroll]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isEnabled) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed bottom-20 right-4 z-30 md:bottom-4"
        >
          <Button
            onClick={scrollToTop}
            size="icon"
            className="rounded-full h-10 w-10 shadow-lg bg-secondary hover:bg-secondary/90"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTop;
