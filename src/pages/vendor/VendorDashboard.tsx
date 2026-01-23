import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useVendorStore } from '@/hooks/useVendorStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Store, LayoutDashboard, Layers, Package, ShoppingCart } from 'lucide-react';

import VendorOverview from '@/components/vendor/VendorOverview';
import VendorStoreForm from '@/components/vendor/VendorStoreForm';
import VendorSectionsManager from '@/components/vendor/VendorSectionsManager';
import VendorProductsManager from '@/components/vendor/VendorProductsManager';

const VendorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { 
    vendor, 
    store, 
    sections, 
    products, 
    stats, 
    loading,
    refreshData 
  } = useVendorStore();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!loading && !vendor) {
      navigate('/vendor/register');
    }
  }, [loading, vendor, navigate]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!vendor) {
    return null;
  }

  if (vendor.status === 'pending') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <Store className="w-16 h-16 mx-auto mb-4 text-warning" />
            <h2 className="text-2xl font-bold mb-2">Application Under Review</h2>
            <p className="text-muted-foreground mb-4">
              Your vendor application is being reviewed. We'll contact you soon!
            </p>
            <Badge variant="secondary">Status: Pending</Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (vendor.status === 'rejected') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <Store className="w-16 h-16 mx-auto mb-4 text-destructive" />
            <h2 className="text-2xl font-bold mb-2">Application Not Approved</h2>
            <p className="text-muted-foreground mb-4">
              Unfortunately, your vendor application was not approved.
            </p>
            <Badge variant="destructive">Status: Rejected</Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-4 md:grid-cols-4 gap-2 h-auto p-1">
          <TabsTrigger value="overview" className="flex items-center gap-2 py-2">
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden md:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="store" className="flex items-center gap-2 py-2">
            <Store className="h-4 w-4" />
            <span className="hidden md:inline">Store</span>
          </TabsTrigger>
          <TabsTrigger value="sections" className="flex items-center gap-2 py-2">
            <Layers className="h-4 w-4" />
            <span className="hidden md:inline">Sections</span>
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2 py-2">
            <Package className="h-4 w-4" />
            <span className="hidden md:inline">Products</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <VendorOverview 
            vendor={vendor}
            store={store}
            stats={stats}
            onCreateStore={() => {
              const tabsList = document.querySelector('[role="tablist"]');
              const storeTab = tabsList?.querySelector('[value="store"]') as HTMLButtonElement;
              storeTab?.click();
            }}
          />
        </TabsContent>

        <TabsContent value="store">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Store className="h-6 w-6" />
                {store ? 'Store Settings' : 'Create Your Store'}
              </h2>
              <p className="text-muted-foreground">
                {store 
                  ? 'Update your store information and settings'
                  : 'Set up your store to start selling'
                }
              </p>
            </div>
            <VendorStoreForm 
              store={store} 
              onSuccess={refreshData}
            />
          </div>
        </TabsContent>

        <TabsContent value="sections">
          {store ? (
            <VendorSectionsManager 
              sections={sections}
              onRefresh={refreshData}
            />
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <Store className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Create your store first</h3>
                <p className="text-muted-foreground">
                  You need to set up your store before adding sections
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="products">
          <VendorProductsManager 
            products={products}
            sections={sections}
            onRefresh={refreshData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorDashboard;
