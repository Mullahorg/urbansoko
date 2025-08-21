import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // Don't show if user already dismissed or if already installed
  if (!showPrompt || !deferredPrompt || localStorage.getItem('pwa-prompt-dismissed')) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <Card className="shadow-lg border-2 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Download className="h-5 w-5 text-primary" />
            </div>
            
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-1">Install Male Afrique</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Get the app for a better shopping experience with offline access and notifications.
              </p>
              
              <div className="flex gap-2">
                <Button size="sm" onClick={handleInstall} className="text-xs">
                  Install
                </Button>
                <Button size="sm" variant="ghost" onClick={handleDismiss} className="text-xs">
                  Later
                </Button>
              </div>
            </div>
            
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleDismiss}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InstallPrompt;