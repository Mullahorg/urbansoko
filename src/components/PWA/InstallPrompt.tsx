import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
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
      setShowPrompt(true);
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
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm animate-in slide-in-from-bottom-4 duration-500">
      <Card className="shadow-2xl border-2 border-primary/30 bg-gradient-to-br from-background via-background to-primary/5 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="bg-gradient-to-br from-primary/20 to-primary/10 p-3 rounded-xl shadow-inner">
              <Smartphone className="h-6 w-6 text-primary" />
            </div>
            
            <div className="flex-1">
              <h3 className="font-bold text-sm mb-1 text-foreground">Install Male Afrique</h3>
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                Get the app for faster shopping, offline access, and instant notifications on new arrivals!
              </p>
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={handleInstall} 
                  className="text-xs gap-1.5 shadow-lg hover:shadow-xl transition-all"
                >
                  <Download className="h-3.5 w-3.5" />
                  Install Now
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={handleDismiss} 
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Maybe Later
                </Button>
              </div>
            </div>
            
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-7 w-7 text-muted-foreground hover:text-foreground" 
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InstallPrompt;
