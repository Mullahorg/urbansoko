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
import { Shirt, ShoppingBag, Glasses, Crown, Award, TrendingUp } from 'lucide-react';

const categories = [
  {
    title: 'Clothing',
    items: [
      { name: 'Shirts', href: '/category/shirts', description: 'Casual and formal shirts', icon: Shirt },
      { name: 'Pants', href: '/category/pants', description: 'Trousers and casual pants', icon: ShoppingBag },
      { name: 'Suits', href: '/category/suits', description: 'Premium tailored suits', icon: Crown },
      { name: 'Traditional Wear', href: '/category/traditional-wear', description: 'African traditional attire', icon: Award },
    ],
  },
  {
    title: 'Footwear',
    items: [
      { name: 'Formal Shoes', href: '/category/formal-shoes', description: 'Professional footwear' },
      { name: 'Sport Shoes', href: '/category/sport-shoes', description: 'Athletic and casual shoes' },
    ],
  },
  {
    title: 'Accessories',
    items: [
      { name: 'Accessories', href: '/category/accessories', description: 'Belts, ties, and more', icon: Glasses },
    ],
  },
];

const featured = [
  { name: 'New Arrivals', href: '/products?sort=newest', icon: TrendingUp },
  { name: 'Best Sellers', href: '/products?sort=popular', icon: Award },
];

export const MainNav = () => {
  return (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList>
        <NavigationMenuItem>
          <Link to="/" className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50">
            Home
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>Shop</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid gap-3 p-6 md:w-[500px] lg:w-[700px] lg:grid-cols-[1fr_1fr_200px]">
              {/* Clothing Section */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold leading-none text-primary">
                  {categories[0].title}
                </h4>
                <ul className="space-y-3">
                  {categories[0].items.map((item) => (
                    <li key={item.name}>
                      <NavigationMenuLink asChild>
                        <Link
                          to={item.href}
                          className={cn(
                            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground group"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            {item.icon && <item.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />}
                            <div className="text-sm font-medium leading-none">{item.name}</div>
                          </div>
                          <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                            {item.description}
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Footwear & Accessories */}
              <div className="space-y-4">
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold leading-none text-primary">
                    {categories[1].title}
                  </h4>
                  <ul className="space-y-3">
                    {categories[1].items.map((item) => (
                      <li key={item.name}>
                        <NavigationMenuLink asChild>
                          <Link
                            to={item.href}
                            className={cn(
                              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            )}
                          >
                            <div className="text-sm font-medium leading-none">{item.name}</div>
                            <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                              {item.description}
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold leading-none text-primary">
                    {categories[2].title}
                  </h4>
                  <ul className="space-y-3">
                    {categories[2].items.map((item) => (
                      <li key={item.name}>
                        <NavigationMenuLink asChild>
                          <Link
                            to={item.href}
                            className={cn(
                              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground group"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              {item.icon && <item.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />}
                              <div className="text-sm font-medium leading-none">{item.name}</div>
                            </div>
                            <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                              {item.description}
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </div>
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
