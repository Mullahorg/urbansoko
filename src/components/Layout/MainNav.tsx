import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { Shirt, ShoppingBag, Glasses, Crown, Award, TrendingUp, LucideIcon, Store, UtensilsCrossed, Coffee, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  Shirt,
  ShoppingBag,
  Glasses,
  Crown,
  Award,
  Store,
  UtensilsCrossed,
  Coffee,
  Package,
};

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  display_order: number | null;
}

const featured = [
  { name: 'New Arrivals', href: '/products?sort=newest', icon: TrendingUp },
  { name: 'Best Sellers', href: '/products?sort=popular', icon: Award },
];

export const MainNav = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (data) {
        setCategories(data);
      }
    };

    fetchCategories();
  }, []);

  // Group categories dynamically (first 4 as clothing, next 2 as footwear, rest as accessories)
  const clothingCategories = categories.slice(0, 4);
  const footwearCategories = categories.slice(4, 6);
  const accessoryCategories = categories.slice(6);

  return (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList>
        <NavigationMenuItem>
          <Link to="/" className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50">
            Home
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Link to="/stores" className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary hover:text-secondary-foreground focus:bg-secondary focus:text-secondary-foreground focus:outline-none">
            <Store className="h-4 w-4 mr-1.5" />
            Stores
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>Shop</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid gap-3 p-6 md:w-[500px] lg:w-[700px] lg:grid-cols-[1fr_1fr_200px]">
              {/* Clothing Section */}
              {clothingCategories.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold leading-none text-primary">
                    Clothing
                  </h4>
                  <ul className="space-y-3">
                    {clothingCategories.map((item) => {
                      const Icon = item.icon ? iconMap[item.icon] : null;
                      return (
                        <li key={item.id}>
                          <NavigationMenuLink asChild>
                            <Link
                              to={`/category/${item.slug}`}
                              className={cn(
                                "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground group"
                              )}
                            >
                              <div className="flex items-center gap-2">
                                {Icon && <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />}
                                <div className="text-sm font-medium leading-none">{item.name}</div>
                              </div>
                              {item.description && (
                                <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                                  {item.description}
                                </p>
                              )}
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Footwear & Accessories */}
              <div className="space-y-4">
                {footwearCategories.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold leading-none text-primary">
                      Footwear
                    </h4>
                    <ul className="space-y-3">
                      {footwearCategories.map((item) => {
                        const Icon = item.icon ? iconMap[item.icon] : null;
                        return (
                          <li key={item.id}>
                            <NavigationMenuLink asChild>
                              <Link
                                to={`/category/${item.slug}`}
                                className={cn(
                                  "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  {Icon && <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />}
                                  <div className="text-sm font-medium leading-none">{item.name}</div>
                                </div>
                                {item.description && (
                                  <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                                    {item.description}
                                  </p>
                                )}
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {accessoryCategories.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold leading-none text-primary">
                      Accessories
                    </h4>
                    <ul className="space-y-3">
                      {accessoryCategories.map((item) => {
                        const Icon = item.icon ? iconMap[item.icon] : null;
                        return (
                          <li key={item.id}>
                            <NavigationMenuLink asChild>
                              <Link
                                to={`/category/${item.slug}`}
                                className={cn(
                                  "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground group"
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  {Icon && <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />}
                                  <div className="text-sm font-medium leading-none">{item.name}</div>
                                </div>
                                {item.description && (
                                  <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                                    {item.description}
                                  </p>
                                )}
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>

              {/* Featured Section */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold leading-none text-primary">Featured</h4>
                <ul className="space-y-3">
                  {featured.map((item) => (
                    <li key={item.name}>
                      <NavigationMenuLink asChild>
                        <Link
                          to={item.href}
                          className={cn(
                            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 group"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <item.icon className="h-4 w-4 text-primary" />
                            <div className="text-sm font-medium leading-none">{item.name}</div>
                          </div>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  ))}
                  <li>
                    <NavigationMenuLink asChild>
                      <Link
                        to="/products"
                        className={cn(
                          "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground bg-primary/90 text-primary-foreground text-center"
                        )}
                      >
                        <div className="text-sm font-medium leading-none">View All Products</div>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Link to="/about" className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none">
            About
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Link to="/contact" className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none">
            Contact
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};
