import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Sparkles, PartyPopper, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';
import { useGamificationSettings } from '@/hooks/useGamificationSettings';
import { supabase } from '@/integrations/supabase/client';

const WelcomePopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [hasSubscribed, setHasSubscribed] = useState(false);
  const { toast } = useToast();
  const { data: settings } = useGamificationSettings();
  
  const welcomeSettings = settings?.find(s => s.feature === 'welcome_popup');
  const isEnabled = welcomeSettings?.enabled ?? true;
  const delay = welcomeSettings?.settings?.delay ?? 3000;
  const discountPercent = welcomeSettings?.settings?.discount_percent ?? 10;
  const discountCode = welcomeSettings?.settings?.discount_code ?? 'WELCOME10';
  const title = welcomeSettings?.settings?.title ?? 'Welcome Gift!';
  const subtitle = welcomeSettings?.settings?.subtitle ?? `Subscribe now and get ${discountPercent}% OFF your first order!`;

  useEffect(() => {
    if (!isEnabled) return;
    
    const hasSeenPopup = localStorage.getItem('hasSeenWelcomePopup');
    if (!hasSeenPopup) {
      const timer = setTimeout(() => setIsOpen(true), delay);
      return () => clearTimeout(timer);
    }
  }, [isEnabled, delay]);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('hasSeenWelcomePopup', 'true');
  };

  const handleSubscribe = async () => {
    if (!email) return;
    
    // Save to newsletter subscribers
    try {
      await supabase.from('newsletter_subscribers').insert({
        email,
        source: 'welcome_popup',
      });
    } catch (error) {
      console.error('Failed to save subscriber:', error);
    }
    
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    setHasSubscribed(true);
    toast({
      title: "Welcome aboard!"
      ,
      description: `Your ${discountPercent}% discount code: ${discountCode}`,
    });

    setTimeout(handleClose, 2000);
  };

  if (!isEnabled) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 border border-primary/20 rounded-2xl p-8 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="text-center space-y-4">
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 text-primary-foreground"
              >
                {hasSubscribed ? (
                  <PartyPopper className="h-8 w-8" />
                ) : (
                  <Gift className="h-8 w-8" />
                )}
              </motion.div>

              {!hasSubscribed ? (
                <>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
                      <Sparkles className="h-5 w-5 text-yellow-500" />
                      {title}
                      <Sparkles className="h-5 w-5 text-yellow-500" />
                    </h2>
                    <p className="text-muted-foreground">
                      {subtitle.includes('{percent}') 
                        ? subtitle.replace('{percent}', String(discountPercent)) 
                        : `Subscribe now and get ${discountPercent}% OFF your first order!`}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="text-center"
                    />
                    <Button 
                      onClick={handleSubscribe} 
                      className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                    >
                      <Tag className="h-4 w-4 mr-2" />
                      Claim My Discount
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    No spam, just exclusive deals!
                  </p>
                </>
              ) : (
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
                    <PartyPopper className="h-6 w-6" />
                    You're In!
                  </h2>
                  <p className="text-muted-foreground">
                    Use code <span className="font-mono font-bold text-primary">{discountCode}</span> at checkout
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomePopup;
