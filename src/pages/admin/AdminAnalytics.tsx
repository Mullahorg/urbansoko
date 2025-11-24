import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatKES } from '@/utils/currency';
import { TrendingUp, DollarSign, ShoppingCart, Users, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Analytics {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  avgOrderValue: number;
  totalProducts: number;
  totalUsers: number;
}

interface DailyData {
  date: string;
  total_orders: number;
  total_revenue: number;
  avg_order_value: number;
}

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch overall stats
      const [ordersRes, productsRes, usersRes, dailyRes] = await Promise.all([
        supabase.from('orders').select('total_amount, payment_status'),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('order_analytics').select('*').limit(30)
      ]);

      if (ordersRes.error) throw ordersRes.error;
      if (productsRes.error) throw productsRes.error;
      if (usersRes.error) throw usersRes.error;

      const orders = ordersRes.data || [];
      const completedOrders = orders.filter(o => o.payment_status === 'completed');
      const pendingOrders = orders.filter(o => o.payment_status === 'pending');

      const totalRevenue = completedOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
      const avgOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

      setAnalytics({
        totalRevenue,
        totalOrders: orders.length,
        pendingOrders: pendingOrders.length,
        avgOrderValue,
        totalProducts: productsRes.count || 0,
        totalUsers: usersRes.count || 0
      });

      setDailyData(dailyRes.data || []);
    } catch (error: any) {
      toast({
        title: 'Error loading analytics',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold">Analytics Dashboard</h2>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Analytics Dashboard</h2>
        <p className="text-muted-foreground">Overview of your store performance</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatKES(analytics?.totalRevenue || 0)}</div>
            <p className="text-xs text-muted-foreground">
              From {analytics?.totalOrders || 0} completed orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.pendingOrders || 0}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatKES(analytics?.avgOrderValue || 0)}</div>
            <p className="text-xs text-muted-foreground">Per completed order</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalProducts || 0}</div>
            <p className="text-xs text-muted-foreground">In catalog</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">Registered accounts</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Daily Performance</CardTitle>
          <CardDescription>Last 30 days order activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dailyData.slice(0, 10).map((day, idx) => (
              <div key={idx} className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">{new Date(day.date).toLocaleDateString()}</p>
                  <p className="text-sm text-muted-foreground">
                    {day.total_orders} orders
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatKES(Number(day.total_revenue))}</p>
                  <p className="text-xs text-muted-foreground">
                    Avg: {formatKES(Number(day.avg_order_value))}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;
