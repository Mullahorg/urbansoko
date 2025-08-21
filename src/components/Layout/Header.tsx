import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import MobileMenu from './MobileMenu';
import CartSheet from '../Cart/CartSheet';

interface HeaderProps {
  isDark: boolean;
  toggleTheme: () => void;
  cartCount: number;
}

const Header = ({ isDark, toggleTheme, cartCount }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['Shirts', 'Pants', 'Suits', 'Shoes', 'Accessories'];

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
            <Link to="/" className="text-xl md:text-2xl font-bold text-primary">
              Male Afrique
            </Link>

            {/* Search bar - hidden on mobile */}
            <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search for products..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 md:space-x-3">
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <User className="h-4 w-4" />
              </Button>
              
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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search for products..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
};

export default Header;