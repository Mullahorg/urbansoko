import { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

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

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="text-left">Menu</SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col h-full">
          <nav className="flex-1 py-4">
            <div className="px-6 mb-6">
              <Link 
                to="/" 
                className="block py-3 text-lg font-medium hover:text-primary transition-colors"
                onClick={onClose}
              >
                Home
              </Link>
            </div>

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

          <div className="p-6 border-t">
            <div className="space-y-3">
              <Button asChild className="w-full" variant="outline">
                <Link to="/login" onClick={onClose}>Login</Link>
              </Button>
              <Button asChild className="w-full">
                <Link to="/signup" onClick={onClose}>Sign Up</Link>
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;