import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Heart, ShoppingCart, User } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

const MobileBottomNav = () => {
  const location = useLocation();
  const { getTotalItems } = useCart();
  const { user } = useAuth();
  const cartCount = getTotalItems();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/search', icon: Search, label: 'Search' },
    { path: '/wishlist', icon: Heart, label: 'Wishlist' },
    { path: '/checkout', icon: ShoppingCart, label: 'Cart', badge: cartCount },
    { path: user ? '/profile' : '/auth', icon: User, label: user ? 'Account' : 'Sign In' },
  ];

  if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/vendor')) {
    return null;
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border/50 safe-bottom">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path));

          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center gap-0.5 py-1.5 px-3 min-w-[48px]"
            >
              <div className={`relative p-1.5 rounded-xl transition-colors ${isActive ? 'bg-primary/10' : ''}`}>
                <item.icon className={`h-5 w-5 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1.5 h-4 min-w-[16px] flex items-center justify-center p-0 text-[9px] font-semibold bg-primary text-primary-foreground rounded-full shadow-sm">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] transition-colors ${isActive ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
