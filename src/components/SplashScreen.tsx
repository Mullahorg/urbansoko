import { useEffect, useState } from 'react';

const SplashScreen = () => {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Only show on initial app load (not on route changes)
    const seen = sessionStorage.getItem('urbansoko_splash_seen');
    if (seen) {
      setVisible(false);
      return;
    }

    const fadeTimer = setTimeout(() => setFadeOut(true), 1400);
    const hideTimer = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem('urbansoko_splash_seen', '1');
    }, 1900);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background transition-opacity duration-500 ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-hidden={fadeOut}
    >
      {/* Decorative blur orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-primary/10 blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-accent/10 blur-3xl animate-pulse" />

      <div className="relative flex flex-col items-center gap-6">
        {/* Logo with ring animation */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
          <div className="absolute -inset-2 rounded-full border border-accent/30 animate-[spin_3s_linear_infinite]" />
          <div className="relative h-24 w-24 rounded-full bg-card shadow-elegant flex items-center justify-center animate-scale-in">
            <img
              src="/logo.png"
              alt="UrbanSoko"
              className="h-16 w-16 object-contain"
            />
          </div>
        </div>

        {/* Wordmark */}
        <div className="flex flex-col items-center gap-2 animate-fade-in">
          <h1 className="text-3xl font-bold tracking-tight">
            Urban<span className="text-muted-foreground font-light">Soko</span>
          </h1>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Marketplace
          </p>
        </div>

        {/* Loader bar */}
        <div className="mt-4 h-0.5 w-32 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/2 bg-primary animate-[loader_1.4s_ease-in-out_infinite]" />
        </div>
      </div>

      <style>{`
        @keyframes loader {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;