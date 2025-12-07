import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const PROMPT_STORAGE_KEY = 'pwa-prompt-last-shown';
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if we should show the prompt (once per year)
    const lastShown = localStorage.getItem(PROMPT_STORAGE_KEY);
    if (lastShown) {
      const lastShownDate = parseInt(lastShown, 10);
      const timeSinceLastShown = Date.now() - lastShownDate;
      if (timeSinceLastShown < ONE_YEAR_MS) {
        return;
      }
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Delay showing prompt for better UX
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    
    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
    
    // Record that we showed the prompt
    localStorage.setItem(PROMPT_STORAGE_KEY, Date.now().toString());
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Record that we showed the prompt (user dismissed)
    localStorage.setItem(PROMPT_STORAGE_KEY, Date.now().toString());
  };

  if (!showPrompt || !deferredPrompt || isInstalled) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: 100, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm"
      >
        <Card className="shadow-2xl border-2 border-primary/20 glass-premium overflow-hidden">
          {/* Animated background gradient */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"
            animate={{ 
              opacity: [0.5, 0.8, 0.5],
              scale: [1, 1.02, 1]
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          
          <CardContent className="p-5 relative">
            <div className="flex items-start gap-4">
              <motion.div 
                className="bg-gradient-to-br from-primary/20 to-primary/5 p-3.5 rounded-2xl shadow-inner relative"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Smartphone className="h-7 w-7 text-primary" />
                <motion.div
                  className="absolute -top-1 -right-1"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="h-4 w-4 text-accent" />
                </motion.div>
              </motion.div>
              
              <div className="flex-1">
                <h3 className="font-bold text-base mb-1.5 text-foreground">Install Male Afrique</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  Get the app for faster shopping, offline access & exclusive notifications!
                </p>
                
                <div className="flex gap-2.5">
                  <Button 
                    size="sm" 
                    onClick={handleInstall} 
                    className="text-sm gap-2 shadow-lg hover:shadow-xl btn-luxe px-4"
                  >
                    <Download className="h-4 w-4" />
                    Install Now
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={handleDismiss} 
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Maybe Later
                  </Button>
                </div>
              </div>
              
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0" 
                onClick={handleDismiss}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default InstallPrompt;
