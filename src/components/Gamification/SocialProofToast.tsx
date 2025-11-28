import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useGamificationSettings } from '@/hooks/useGamificationSettings';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const locations = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Nyeri', 'Malindi', 'Machakos', 'Kakamega'];
const firstNames = ['John', 'Mary', 'Peter', 'Grace', 'David', 'Sarah', 'James', 'Ann', 'Michael', 'Lucy', 'Joseph', 'Alice'];

const SocialProofToast = () => {
  const indexRef = useRef(0);
  const { data: settings } = useGamificationSettings();
  
  const socialProofSettings = settings?.find(s => s.feature === 'social_proof_toast');
  const isEnabled = socialProofSettings?.enabled ?? true;
  const interval = socialProofSettings?.settings?.interval ?? 30000;
  const showPurchases = socialProofSettings?.settings?.show_purchases ?? true;
  const showCartAdds = socialProofSettings?.settings?.show_cart_adds ?? true;
  const showReviews = socialProofSettings?.settings?.show_reviews ?? true;

  // Fetch real products for realistic messages
  const { data: products } = useQuery({
    queryKey: ['products-for-social-proof'],
    queryFn: async () => {
      const { data } = await supabase
        .from('products')
        .select('name')
        .limit(20);
      return data || [];
    },
    enabled: isEnabled,
  });

  useEffect(() => {
    if (!isEnabled || !products?.length) return;

    const generateMessage = () => {
      const name = firstNames[Math.floor(Math.random() * firstNames.length)];
      const initial = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      const location = locations[Math.floor(Math.random() * locations.length)];
      const product = products[Math.floor(Math.random() * products.length)]?.name || 'African Print Shirt';

      const actions: { action: string; icon: string; enabled: boolean }[] = [];
      if (showPurchases) actions.push({ action: 'just purchased', icon: '🛒', enabled: true });
      if (showCartAdds) actions.push({ action: 'added to cart', icon: '🛍️', enabled: true });
      if (showReviews) actions.push({ action: 'just reviewed', icon: '⭐', enabled: true });
      actions.push({ action: 'is viewing', icon: '👀', enabled: true });
      actions.push({ action: 'added to wishlist', icon: '❤️', enabled: true });

      const enabledActions = actions.filter(a => a.enabled);
      const selectedAction = enabledActions[Math.floor(Math.random() * enabledActions.length)];

      return {
        name: `${name} ${initial}.`,
        location,
        action: selectedAction.action,
        icon: selectedAction.icon,
        product,
      };
    };

    const showNotification = () => {
      const message = generateMessage();
      indexRef.current++;

      toast(
        <div className="flex items-center gap-3">
          <div className="text-2xl">{message.icon}</div>
          <div className="flex-1">
            <p className="font-medium text-sm">
              {message.name} from {message.location}
            </p>
            <p className="text-xs text-muted-foreground">
              {message.action} <span className="font-medium text-primary">{message.product}</span>
            </p>
          </div>
        </div>,
        {
          duration: 4000,
          position: 'bottom-left',
          className: 'bg-background border shadow-lg',
        }
      );
    };

    // Show first notification after a delay
    const initialTimer = setTimeout(showNotification, 10000);
    
    // Then show periodically
    const intervalTimer = setInterval(showNotification, interval);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, [isEnabled, interval, showPurchases, showCartAdds, showReviews, products]);

  return null;
};

export default SocialProofToast;
