import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VendorData, StoreData, VendorStats } from '@/hooks/useVendorStore';
import { formatKES } from '@/utils/currency';
import { 
  Store, Package, TrendingUp, DollarSign, 
  ShoppingCart, Eye, ArrowRight, AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface VendorOverviewProps {
  vendor: VendorData;
  store: StoreData | null;
  stats: VendorStats;
  onCreateStore: () => void;
}

const VendorOverview = ({ vendor, store, stats, onCreateStore }: VendorOverviewProps) => {
  const vendorShare = stats.revenue * (100 - vendor.commission_rate) / 100;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{vendor.business_name}</h1>
          <p className="text-muted-foreground">Welcome to your vendor dashboard</p>
        </div>
        {store && (
          <Button asChild variant="outline">
            <Link to={`/store/${store.slug}`}>
              <Eye className="mr-2 h-4 w-4" />
              View Store
            </Link>
          </Button>
        )}
      </div>

      {/* Store Setup Alert */}
      {!store && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="py-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">Complete Your Store Setup</h3>
                <p className="text-muted-foreground mb-4">
                  Create your store to start selling products on Soko Fresh. 
                  Add your logo, banner, and delivery settings.
                </p>
                <Button onClick={onCreateStore}>
                  Create Your Store
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total Products</p>
              <Package className="h-5 w-5 text-primary" />
            </div>
            <p className="text-3xl font-bold">{stats.totalProducts}</p>
            <p className="text-xs text-muted-foreground mt-1">
              In your catalog
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total Sales</p>
              <ShoppingCart className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold">{stats.totalSales}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Items sold
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold">{formatKES(stats.revenue)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Gross sales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Your Earnings</p>
              <DollarSign className="h-5 w-5 text-amber-500" />
            </div>
            <p className="text-3xl font-bold">{formatKES(vendorShare)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              After {vendor.commission_rate}% commission
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Store Preview */}
      {store && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Your Store
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              {/* Store Banner/Logo */}
              <div className="md:w-1/3">
                {store.banner_url ? (
                  <div className="relative rounded-lg overflow-hidden">
                    <img
                      src={store.banner_url}
                      alt={store.name}
                      className="w-full h-32 object-cover"
                    />
                    {store.logo_url && (
                      <img
                        src={store.logo_url}
                        alt={`${store.name} logo`}
                        className="absolute bottom-2 left-2 w-16 h-16 rounded-lg border-2 border-background object-cover"
                      />
                    )}
                  </div>
                ) : store.logo_url ? (
                  <img
                    src={store.logo_url}
                    alt={store.name}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center">
                    <Store className="h-10 w-10 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Store Details */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-semibold">{store.name}</h3>
                  <Badge variant={store.status === 'active' ? 'default' : 'secondary'}>
                    {store.status}
                  </Badge>
                </div>
                {store.description && (
                  <p className="text-muted-foreground mb-3">{store.description}</p>
                )}
                <div className="flex flex-wrap gap-4 text-sm">
                  {store.category && (
                    <span className="text-muted-foreground">
                      Category: <span className="text-foreground">{store.category}</span>
                    </span>
                  )}
                  {store.delivery_enabled && (
                    <span className="text-muted-foreground">
                      Delivery: <span className="text-foreground">{formatKES(store.delivery_fee)}</span>
                    </span>
                  )}
                  {store.min_order_amount > 0 && (
                    <span className="text-muted-foreground">
                      Min Order: <span className="text-foreground">{formatKES(store.min_order_amount)}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto py-4 flex flex-col" asChild>
              <Link to="/vendor/products">
                <Package className="h-6 w-6 mb-2" />
                <span>Manage Products</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col" asChild>
              <Link to="/vendor/orders">
                <ShoppingCart className="h-6 w-6 mb-2" />
                <span>View Orders</span>
              </Link>
            </Button>
            {store && (
              <Button variant="outline" className="h-auto py-4 flex flex-col" asChild>
                <Link to={`/store/${store.slug}`}>
                  <Eye className="h-6 w-6 mb-2" />
                  <span>Preview Store</span>
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorOverview;
