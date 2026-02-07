import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, Star, Clock, Truck, Store, Filter, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Store {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  logo_url: string | null;
  banner_url: string | null;
  rating: number | null;
  status: string;
  delivery_enabled: boolean | null;
  pickup_enabled: boolean | null;
  min_order_amount: number | null;
  delivery_fee: number | null;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const StoresPage = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const { toast } = useToast();

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('status', 'active')
        .order('rating', { ascending: false });

      if (error) throw error;
      setStores(data || []);
    } catch (error: any) {
      toast({
        title: 'Error loading stores',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...new Set(stores.map(s => s.category).filter(Boolean))];

  const filteredStores = stores
    .filter(store => {
      const matchesSearch = store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || store.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 py-12 md:py-20">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-10 left-10 w-72 h-72 bg-secondary/20 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-10 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }}
            transition={{ duration: 10, repeat: Infinity }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Badge className="mb-4 bg-secondary/20 text-secondary border-secondary/30">
              <Store className="h-3 w-3 mr-1" />
              Explore Local Stores
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Discover Amazing{' '}
              <span className="text-secondary">Stores</span>
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              Shoes, clothing, kitchen &amp; home appliances — from verified vendors on UrbanSoko
            </p>

            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search stores, products, and categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 h-14 text-lg rounded-full border-2 border-muted bg-background/80 backdrop-blur-sm focus:border-secondary"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 border-b bg-muted/30 sticky top-16 z-30 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-3 items-center">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Top Rated</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <p className="text-sm text-muted-foreground">
              {filteredStores.length} stores found
            </p>
          </div>
        </div>
      </section>

      {/* Stores Grid */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-40 w-full" />
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredStores.length === 0 ? (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No stores found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'Try a different search term' : 'Check back soon for new stores'}
              </p>
              {searchQuery && (
                <Button variant="outline" onClick={() => setSearchQuery('')}>
                  Clear Search
                </Button>
              )}
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              {filteredStores.map((store) => (
                <motion.div key={store.id} variants={itemVariants}>
                  <Link to={`/store/${store.slug}`}>
                    <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-2 hover:border-secondary/50">
                      {/* Banner */}
                      <div className="relative h-40 bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
                        {store.banner_url ? (
                          <img
                            src={store.banner_url}
                            alt={store.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Store className="h-12 w-12 text-muted-foreground/50" />
                          </div>
                        )}
                        
                        {/* Category Badge */}
                        {store.category && (
                          <Badge className="absolute top-3 left-3 bg-background/90 text-foreground">
                            {store.category}
                          </Badge>
                        )}

                        {/* Logo */}
                        {store.logo_url && (
                          <div className="absolute -bottom-6 left-4 w-14 h-14 rounded-xl bg-background border-2 border-border overflow-hidden shadow-lg">
                            <img
                              src={store.logo_url}
                              alt={store.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>

                      <CardContent className="p-4 pt-8">
                        <h3 className="font-semibold text-lg mb-1 group-hover:text-secondary transition-colors line-clamp-1">
                          {store.name}
                        </h3>
                        
                        {store.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {store.description}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                          {store.rating && store.rating > 0 && (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-secondary text-secondary" />
                              <span className="font-medium text-foreground">{store.rating.toFixed(1)}</span>
                            </div>
                          )}
                          
                          {store.delivery_enabled && (
                            <div className="flex items-center gap-1">
                              <Truck className="h-4 w-4" />
                              <span>Delivery</span>
                            </div>
                          )}

                          {store.pickup_enabled && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>Pickup</span>
                            </div>
                          )}
                        </div>

                        {store.min_order_amount && store.min_order_amount > 0 && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Min order: KES {store.min_order_amount.toLocaleString()}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-gradient-to-r from-primary to-primary/80">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
              Want to sell on UrbanSoko?
            </h2>
            <p className="text-primary-foreground/80 mb-6 max-w-xl mx-auto">
              Join our marketplace and reach thousands of customers. Start selling your shoes, clothing, appliances and more today.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link to="/vendor/register">
                Become a Vendor
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default StoresPage;
