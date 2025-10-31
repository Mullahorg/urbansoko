import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Store, Package, TrendingUp, DollarSign, Plus } from 'lucide-react';
import { formatKES } from '@/utils/currency';
import { useToast } from '@/hooks/use-toast';

interface VendorData {
  id: string;
  business_name: string;
  status: string;
  commission_rate: number;
}

const VendorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [vendor, setVendor] = useState<VendorData | null>(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchVendorData();
  }, [user]);

  const fetchVendorData = async () => {
    const { data: vendorData, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('user_id', user!.id)
      .single();

    if (error || !vendorData) {
      // No vendor profile found
      navigate('/vendor/register');
      return;
    }

    setVendor(vendorData);

    if (vendorData.status !== 'approved') {
      setLoading(false);
      return;
    }

    // Fetch vendor stats
    const { data: products } = await supabase
      .from('products')
      .select('id')
      .eq('vendor_id', vendorData.id);

    const { data: orderItems } = await supabase
      .from('order_items')
      .select('quantity, price, product:products!inner(vendor_id)')
      .eq('product.vendor_id', vendorData.id);

    const totalRevenue = orderItems?.reduce((sum, item) => 
      sum + (item.quantity * Number(item.price)), 0
    ) || 0;

    setStats({
      totalProducts: products?.length || 0,
      totalSales: orderItems?.length || 0,
      revenue: totalRevenue,
    });

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{vendor.business_name}</h1>
          <p className="text-muted-foreground">Vendor Dashboard</p>
        </div>
        <Button onClick={() => navigate('/vendor/products/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total Products</p>
              <Package className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-bold">{stats.totalProducts}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total Sales</p>
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <p className="text-3xl font-bold">{stats.totalSales}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Revenue</p>
              <DollarSign className="w-5 h-5 text-warning" />
            </div>
            <p className="text-3xl font-bold">{formatKES(stats.revenue)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Your share: {formatKES(stats.revenue * (100 - vendor.commission_rate) / 100)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" onClick={() => navigate('/vendor/products')}>
              <Package className="mr-2 h-4 w-4" />
              Manage Products
            </Button>
            <Button variant="outline" onClick={() => navigate('/vendor/orders')}>
              <TrendingUp className="mr-2 h-4 w-4" />
              View Orders
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorDashboard;
