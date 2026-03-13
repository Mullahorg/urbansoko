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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border safe-bottom">
      <div className="flex items-center justify-around py-1.5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path));

          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center gap-0.5 py-1 px-3 min-w-[48px]"
            >
              <div className="relative">
                <item.icon className={`h-5 w-5 ${isActive ? 'text-foreground' : 'text-muted-foreground'}`} />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 h-3.5 min-w-[14px] flex items-center justify-center p-0 text-[9px] bg-foreground text-background rounded-full">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] ${isActive ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
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
