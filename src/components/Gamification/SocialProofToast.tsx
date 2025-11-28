import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

const socialProofMessages = [
  { name: 'John K.', location: 'Nairobi', action: 'just purchased', product: 'African Print Shirt' },
  { name: 'Mary W.', location: 'Mombasa', action: 'just purchased', product: 'Dashiki Collection' },
  { name: 'Peter M.', location: 'Kisumu', action: 'added to cart', product: 'Kente Fabric Set' },
  { name: 'Grace A.', location: 'Nakuru', action: 'just purchased', product: 'Safari Jacket' },
  { name: 'David O.', location: 'Eldoret', action: 'is viewing', product: 'Maasai Beaded Accessories' },
  { name: 'Sarah N.', location: 'Nairobi', action: 'just reviewed', product: 'Ankara Blazer' },
  { name: 'James K.', location: 'Thika', action: 'just purchased', product: 'Traditional Kikoi' },
  { name: 'Ann M.', location: 'Nyeri', action: 'added to wishlist', product: 'Printed Kaftan' },
];

interface SocialProofToastProps {
  enabled?: boolean;
  interval?: number;
}

const SocialProofToast = ({ enabled = true, interval = 30000 }: SocialProofToastProps) => {
  const indexRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    const showNotification = () => {
      const message = socialProofMessages[indexRef.current % socialProofMessages.length];
      indexRef.current++;

      const icons: Record<string, string> = {
        'just purchased': '🛒',
        'added to cart': '🛍️',
        'is viewing': '👀',
        'just reviewed': '⭐',
        'added to wishlist': '❤️',
      };

      toast(
        <div className="flex items-center gap-3">
          <div className="text-2xl">{icons[message.action] || '🛒'}</div>
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
  }, [enabled, interval]);

  return null;
};

export default SocialProofToast;
