import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, User, Package, Heart, Trophy, Store, Shield, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useLanguage } from '@/contexts/LanguageContext';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const { user, signOut } = useAuth();
  const { isAdmin, isVendor } = useUserRole();
  const { t } = useLanguage();

  const categories = [
    {
      name: 'Shirts',
      subcategories: ['Casual Shirts', 'Formal Shirts', 'Polo Shirts']
    },
    {
      name: 'Pants',
      subcategories: ['Chinos', 'Trousers', 'Joggers']
    },
    {
      name: 'Suits',
      subcategories: ['Business Suits', 'Formal Suits', 'Blazers']
    },
    {
      name: 'Sport Shoes',
      subcategories: ['Running Shoes', 'Basketball Shoes', 'Football Boots', 'Training Shoes']
    },
    {
      name: 'Formal Shoes',
      subcategories: ['Oxford Shoes', 'Loafers', 'Boots', 'Derby Shoes']
    },
    {
      name: 'Traditional Wear',
      subcategories: ['Kanzu', 'Kikoy', 'Wedding Suits', 'Ceremonial Wear']
    },
    {
      name: 'Accessories',
      subcategories: ['Ties', 'Belts', 'Watches', 'Hats']
    }
  ];

  const toggleCategory = (categoryName: string) => {
    setExpandedCategory(expandedCategory === categoryName ? null : categoryName);
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-80 p-0 flex flex-col">
        <SheetHeader className="p-6 border-b flex-shrink-0">
          <SheetTitle className="text-left">Menu</SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="flex-1">
          <div className="flex flex-col">
            <nav className="py-4">
              <div className="px-6 mb-6">
                <Link 
                  to="/" 
                  className="block py-3 text-lg font-medium hover:text-primary transition-colors"
                  onClick={onClose}
                >
                  Home
                </Link>
              </div>

              {/* User Account Section */}
              {user && (
                <>
                  <div className="px-6 mb-6">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                      Account
                    </h3>
                    <div className="space-y-1">
                      <Link
                        to="/profile"
                        className="flex items-center py-3 text-base hover:text-primary transition-colors"
                        onClick={onClose}
                      >
                        <User className="mr-3 h-4 w-4" />
                        {t('nav.profile')}
                      </Link>
                      
                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center py-3 text-base hover:text-primary transition-colors"
                          onClick={onClose}
                        >
                          <Shield className="mr-3 h-4 w-4" />
                          {t('nav.admin')}
                        </Link>
                      )}
                      
                      {isVendor && (
                        <Link
                          to="/vendor/dashboard"
                          className="flex items-center py-3 text-base hover:text-primary transition-colors"
                          onClick={onClose}
                        >
                          <Store className="mr-3 h-4 w-4" />
                          {t('nav.vendor')}
                        </Link>
                      )}
                      
                      <Link
                        to="/orders"
                        className="flex items-center py-3 text-base hover:text-primary transition-colors"
                        onClick={onClose}
                      >
                        <Package className="mr-3 h-4 w-4" />
                        {t('nav.orders')}
                      </Link>
                      
                      <Link
                        to="/wishlist"
                        className="flex items-center py-3 text-base hover:text-primary transition-colors"
                        onClick={onClose}
                      >
                        <Heart className="mr-3 h-4 w-4" />
                        {t('nav.wishlist')}
                      </Link>
                      
                      <Link
                        to="/rewards"
                        className="flex items-center py-3 text-base hover:text-primary transition-colors"
                        onClick={onClose}
                      >
                        <Trophy className="mr-3 h-4 w-4" />
                        {t('nav.rewards')}
                      </Link>
                      
                      {!isVendor && !isAdmin && (
                        <Link
                          to="/vendor/register"
                          className="flex items-center py-3 text-base hover:text-primary transition-colors"
                          onClick={onClose}
                        >
                          <Store className="mr-3 h-4 w-4" />
                          {t('nav.becomeVendor')}
                        </Link>
                      )}
                    </div>
                  </div>
                  <Separator className="my-4" />
                </>
              )}

              <div className="px-6">
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                  Categories
                </h3>
                
                {categories.map((category) => (
                  <div key={category.name} className="mb-2">
                    <button
                      onClick={() => toggleCategory(category.name)}
                      className="flex items-center justify-between w-full py-3 text-left hover:text-primary transition-colors"
                    >
                      <span className="font-medium">{category.name}</span>
                      {expandedCategory === category.name ? 
                        <ChevronDown className="h-4 w-4" /> : 
                        <ChevronRight className="h-4 w-4" />
                      }
                    </button>
                    
                    {expandedCategory === category.name && (
                      <div className="ml-4 mb-2">
                        <Link
                          to={`/category/${category.name.toLowerCase()}`}
                          className="block py-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                          onClick={onClose}
                        >
                          All {category.name}
                        </Link>
                        {category.subcategories.map((sub) => (
                          <Link
                            key={sub}
                            to={`/category/${category.name.toLowerCase()}/${sub.toLowerCase().replace(' ', '-')}`}
                            className="block py-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                            onClick={onClose}
                          >
                            {sub}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </nav>
          </div>
        </ScrollArea>

        <div className="p-6 border-t flex-shrink-0">
          {user ? (
            <Button 
              onClick={handleSignOut} 
              className="w-full" 
              variant="outline"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {t('nav.signOut')}
            </Button>
          ) : (
            <div className="space-y-3">
              <Button asChild className="w-full" variant="outline">
                <Link to="/track-order" onClick={onClose}>Track Order</Link>
              </Button>
              <Button asChild className="w-full">
                <Link to="/auth" onClick={onClose}>Sign In</Link>
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;