import { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, LogOut, Package, Heart, Trophy, Store, Shield, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import logo from '@/assets/logo.jpeg';
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
import LanguageSelector from '../UI/LanguageSelector';
import { MainNav } from './MainNav';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSiteContent } from '@/hooks/useSiteContent';
import { getAutocompleteSuggestions, getSuggestedTerms } from '@/utils/smartSearch';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

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
  const { role, isAdmin, isVendor } = useUserRole();
  const { t } = useLanguage();
  const { content } = useSiteContent();

  // Fetch products for autocomplete
  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from('products')
        .select('name, category')
        .limit(100);
      if (data) setProducts(data);
    };
    fetchProducts();
  }, []);

  // Handle click outside to close suggestions
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
    return [...new Set([...smart, ...auto])].slice(0, 6);
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
      <header className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-md bg-card/95">
        <div className="container mx-auto px-4">
          {/* Top bar */}
          <div className="flex items-center justify-between py-3 md:py-4">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt={content.header.siteName} className="h-8 w-8 object-contain" />
              <span className="text-lg md:text-xl font-bold text-primary">{content.header.siteName}</span>
            </Link>

          {/* Search bar - hidden on mobile */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8" ref={searchRef}>
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search products... (smart search)"
                className="pl-10"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
              />
              
              {/* Autocomplete Dropdown */}
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden"
                  >
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={`${suggestion}-${index}`}
                        type="button"
                        className="w-full px-4 py-2.5 text-left hover:bg-muted transition-colors flex items-center gap-2 text-sm"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <Sparkles className="h-3 w-3 text-primary" />
                        <span>{suggestion}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 md:space-x-3">
              <LanguageSelector />
              <ThemeSelector />
              
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      {t('nav.profile')}
                    </DropdownMenuItem>
                    
                    {isAdmin && (
                      <DropdownMenuItem onClick={() => navigate('/admin')}>
                        <Shield className="mr-2 h-4 w-4" />
                        {t('nav.admin')}
                      </DropdownMenuItem>
                    )}
                    
                    {isVendor && (
                      <DropdownMenuItem onClick={() => navigate('/vendor/dashboard')}>
                        <Store className="mr-2 h-4 w-4" />
                        {t('nav.vendor')}
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuItem onClick={() => navigate('/orders')}>
                      <Package className="mr-2 h-4 w-4" />
                      {t('nav.orders')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/wishlist')}>
                      <Heart className="mr-2 h-4 w-4" />
                      {t('nav.wishlist')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/rewards')}>
                      <Trophy className="mr-2 h-4 w-4" />
                      {t('nav.rewards')}
                    </DropdownMenuItem>
                    
                    {!isVendor && !isAdmin && (
                      <DropdownMenuItem onClick={() => navigate('/vendor/register')}>
                        <Store className="mr-2 h-4 w-4" />
                        {t('nav.becomeVendor')}
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      {t('nav.signOut')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/track-order')} className="hidden sm:flex">
                    {t('nav.trackOrder')}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/auth')} className="hidden sm:flex">
                    {t('nav.signIn')}
                  </Button>
                </>
              )}
              
              <CartSheet 
                trigger={
                  <Button variant="ghost" size="icon" className="relative">
                    <ShoppingCart className="h-4 w-4" />
                    {cartCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs bg-accent text-accent-foreground min-w-[16px]">
                        {cartCount > 9 ? '9+' : cartCount}
                      </Badge>
                    )}
                  </Button>
                }
              />
            </div>
          </div>

          {/* Desktop Navigation - Enhanced Mega Menu */}
          <div className="hidden md:flex pb-4">
            <MainNav />
          </div>

          {/* Mobile search */}
          <div className="lg:hidden pb-4">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Smart search..."
                className="pl-10"
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
