import { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, LogOut, Package, Heart, Trophy, Store, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MobileMenu from './MobileMenu';
import CartSheet from '../Cart/CartSheet';
import ThemeSelector from '../UI/ThemeSelector';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { getAutocompleteSuggestions, getSuggestedTerms } from '@/utils/smartSearch';
import { supabase } from '@/integrations/supabase/client';

interface HeaderProps {
  cartCount: number;
}

const Header = ({ cartCount }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [products, setProducts] = useState<{ name: string; category: string }[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isAdmin, isVendor } = useUserRole();

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase.from('products').select('name, category').limit(100);
      if (data) setProducts(data);
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const suggestions = useMemo(() => {
    if (searchQuery.length < 2) return [];
    const auto = getAutocompleteSuggestions(searchQuery, products);
    const smart = getSuggestedTerms(searchQuery);
    return [...new Set([...smart, ...auto])].slice(0, 5);
  }, [searchQuery, products]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    navigate(`/search?q=${encodeURIComponent(suggestion)}`);
    setShowSuggestions(false);
  };

  return (
    <>
      <header className="bg-background/80 backdrop-blur-xl border-b border-border/60 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-[68px]">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-10 w-10 rounded-xl"
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <img src="/logo.png" alt="UrbanSoko" className="h-10 w-10 object-contain transition-transform group-hover:scale-105" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-lg font-bold tracking-tight text-foreground" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  Urban<span className="text-primary">Soko</span>
                </span>
                <span className="text-[9px] text-muted-foreground tracking-[0.2em] uppercase">Marketplace</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {[
                { to: '/products', label: 'Products' },
                { to: '/stores', label: 'Stores' },
                { to: '/about', label: 'About' },
              ].map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Search */}
            <div className="hidden lg:flex items-center flex-1 max-w-sm mx-6" ref={searchRef}>
              <form onSubmit={handleSearch} className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  className="pl-10 h-10 text-sm bg-muted/40 border-transparent rounded-xl focus:border-primary/30 focus:bg-background transition-all"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                  onFocus={() => setShowSuggestions(true)}
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden p-1">
                    {suggestions.map((s, i) => (
                      <button
                        key={`${s}-${i}`}
                        type="button"
                        className="w-full px-3 py-2.5 text-left hover:bg-muted rounded-lg transition-colors text-sm"
                        onClick={() => handleSuggestionClick(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </form>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5">
              <ThemeSelector />

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl">
                      <User className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 rounded-xl p-1">
                    <DropdownMenuItem onClick={() => navigate('/profile')} className="rounded-lg py-2.5">
                      <User className="mr-2.5 h-4 w-4" /> Profile
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem onClick={() => navigate('/admin')} className="rounded-lg py-2.5">
                        <Shield className="mr-2.5 h-4 w-4" /> Admin
                      </DropdownMenuItem>
                    )}
                    {isVendor && (
                      <DropdownMenuItem onClick={() => navigate('/vendor/dashboard')} className="rounded-lg py-2.5">
                        <Store className="mr-2.5 h-4 w-4" /> Vendor Dashboard
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => navigate('/orders')} className="rounded-lg py-2.5">
                      <Package className="mr-2.5 h-4 w-4" /> Orders
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/wishlist')} className="rounded-lg py-2.5">
                      <Heart className="mr-2.5 h-4 w-4" /> Wishlist
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/rewards')} className="rounded-lg py-2.5">
                      <Trophy className="mr-2.5 h-4 w-4" /> Rewards
                    </DropdownMenuItem>
                    {!isVendor && !isAdmin && (
                      <DropdownMenuItem onClick={() => navigate('/vendor/register')} className="rounded-lg py-2.5">
                        <Store className="mr-2.5 h-4 w-4" /> Become a Vendor
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut} className="rounded-lg py-2.5 text-destructive">
                      <LogOut className="mr-2.5 h-4 w-4" /> Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => navigate('/auth')}
                  className="hidden sm:flex text-sm rounded-xl h-9 px-5"
                >
                  Sign In
                </Button>
              )}

              <CartSheet
                trigger={
                  <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl">
                    <ShoppingCart className="h-4 w-4" />
                    {cartCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 h-5 min-w-[20px] flex items-center justify-center p-0 text-[10px] font-semibold bg-primary text-primary-foreground rounded-full shadow-sm">
                        {cartCount > 9 ? '9+' : cartCount}
                      </span>
                    )}
                  </Button>
                }
              />
            </div>
          </div>

          {/* Mobile search */}
          <div className="lg:hidden pb-3">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search products..."
                className="pl-10 h-10 text-sm bg-muted/40 border-transparent rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>
        </div>
      </header>

      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
};

export default Header;
