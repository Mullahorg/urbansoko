import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, LogOut, Package, Heart, Trophy, Store } from 'lucide-react';
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
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  cartCount: number;
}

const Header = ({ cartCount }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const categories = [
    'Shirts', 'Pants', 'Suits', 'Sport Shoes', 'Formal Shoes', 'Accessories', 'Traditional Wear'
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
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
              <img src={logo} alt="Male Afrique Wear" className="h-10 w-10 md:h-12 md:w-12 object-contain" />
              <span className="text-xl md:text-2xl font-bold text-primary hidden sm:inline">Male Afrique</span>
            </Link>

          {/* Search bar - hidden on mobile */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search for products..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 md:space-x-3">
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
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/orders')}>
                      <Package className="mr-2 h-4 w-4" />
                      My Orders
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/wishlist')}>
                      <Heart className="mr-2 h-4 w-4" />
                      Wishlist
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/rewards')}>
                      <Trophy className="mr-2 h-4 w-4" />
                      Rewards
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/vendor/register')}>
                      <Store className="mr-2 h-4 w-4" />
                      Become a Vendor
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/track-order')} className="hidden sm:flex">
                    Track Order
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/auth')} className="hidden sm:flex">
                    Sign In
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

          {/* Desktop Navigation */}
          <nav className="hidden md:block pb-4">
            <ul className="flex space-x-8">
              <li>
                <Link to="/" className="text-foreground hover:text-primary transition-colors py-2">
                  Home
                </Link>
              </li>
              {categories.map((category) => (
                <li key={category}>
                  <Link
                    to={`/category/${category.toLowerCase()}`}
                    className="text-foreground hover:text-primary transition-colors py-2"
                  >
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Mobile search */}
          <div className="lg:hidden pb-4">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search for products..."
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
