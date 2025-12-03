import confetti from 'canvas-confetti';
import { supabase } from '@/integrations/supabase/client';

let cachedSettings: { enabled: boolean; on_add_to_cart: boolean; on_purchase: boolean } | null = null;

const fetchConfettiSettings = async () => {
  if (cachedSettings) return cachedSettings;
  
  try {
    const { data } = await supabase
      .from('gamification_settings')
      .select('enabled, settings')
      .eq('feature', 'confetti_animations')
      .single();
    
    if (data) {
      cachedSettings = {
        enabled: data.enabled,
        on_add_to_cart: (data.settings as any)?.on_add_to_cart ?? true,
        on_purchase: (data.settings as any)?.on_purchase ?? true,
      };
      // Cache for 30 seconds
      setTimeout(() => { cachedSettings = null; }, 30000);
    }
  } catch (error) {
    console.error('Error fetching confetti settings:', error);
  }
  
  return cachedSettings || { enabled: true, on_add_to_cart: true, on_purchase: true };
};

export const triggerAddToCartAnimation = async () => {
  const settings = await fetchConfettiSettings();
  if (!settings.enabled || !settings.on_add_to_cart) return;
  
  confetti({
    particleCount: 30,
    spread: 50,
    origin: { y: 0.7, x: 0.5 },
    colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'],
    ticks: 100,
    gravity: 1.2,
    scalar: 0.8,
  });
};

export const triggerPurchaseAnimation = async () => {
  const settings = await fetchConfettiSettings();
  if (!settings.enabled || !settings.on_purchase) return;
  
  const duration = 3000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#FFD700', '#FF6B6B', '#4ECDC4'],
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#FFD700', '#FF6B6B', '#4ECDC4'],
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  frame();
};

export const triggerRewardAnimation = async () => {
  const settings = await fetchConfettiSettings();
  if (!settings.enabled) return;
  
  confetti({
    particleCount: 50,
    spread: 100,
    origin: { y: 0.5 },
    shapes: ['star'],
    colors: ['#FFD700', '#FFA500', '#FFFF00'],
  });
};
