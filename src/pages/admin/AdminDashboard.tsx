import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingCart, Users, DollarSign, TrendingUp, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { formatKES } from '@/utils/currency';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
    todayOrders: 0,
    todayRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [products, orders, users, pendingOrders, lowStock, todayOrders, recentOrdersData, topProductsData] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('total_amount'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('products').select('*', { count: 'exact', head: true }).lt('stock', 10),
      supabase.from('orders').select('total_amount, created_at').gte('created_at', today.toISOString()),
      supabase.from('orders').select('id, created_at, status, total_amount, profiles(full_name)').order('created_at', { ascending: false }).limit(5),
      supabase.from('order_items').select('product_id, quantity, products(name, price, images)').limit(5),
    ]);

    const revenue = orders.data?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
    const todayRev = todayOrders.data?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

    setStats({
      totalProducts: products.count || 0,
      totalOrders: orders.data?.length || 0,
      totalUsers: users.count || 0,
      totalRevenue: revenue,
      pendingOrders: pendingOrders.count || 0,
      lowStockProducts: lowStock.count || 0,
      todayOrders: todayOrders.data?.length || 0,
      todayRevenue: todayRev,
    });

    setRecentOrders(recentOrdersData.data || []);
    
    // Process top products
    const productMap = new Map();
    topProductsData.data?.forEach((item: any) => {
      const existing = productMap.get(item.product_id) || { quantity: 0, product: item.products };
      existing.quantity += item.quantity;
      productMap.set(item.product_id, existing);
    });
    const topProds = Array.from(productMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
    setTopProducts(topProds);
  };

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
    },
    {
      title: 'Total Revenue',
      value: formatKES(stats.totalRevenue),
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
    },
  ];

  const alertCards = [
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950',
      action: () => navigate('/admin/orders'),
    },
    {
      title: 'Low Stock Items',
      value: stats.lowStockProducts,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-950',
      action: () => navigate('/admin/products'),
    },
    {
      title: "Today's Orders",
      value: stats.todayOrders,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      title: "Today's Revenue",
      value: formatKES(stats.todayRevenue),
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
    },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200',
      processing: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200',
      shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200',
      delivered: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-4 md:space-y-6 max-w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4">
        <div>
          <h2 className="text-xl md:text-3xl font-bold">Dashboard</h2>
          <p className="text-sm md:text-base text-muted-foreground">Overview of your eCommerce store</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="text-xs md:text-sm" onClick={() => navigate('/admin/products')}>Manage Products</Button>
          <Button size="sm" variant="outline" className="text-xs md:text-sm" onClick={() => navigate('/admin/orders')}>View Orders</Button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 md:p-6 md:pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-1.5 md:p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 md:h-5 md:w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
              <div className="text-lg md:text-2xl font-bold truncate">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts & Today's Activity */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {alertCards.map((alert) => (
          <Card 
            key={alert.title} 
            className={`hover:shadow-lg transition-all cursor-pointer ${alert.action ? 'hover:border-primary' : ''}`}
            onClick={alert.action}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 md:p-6 md:pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">{alert.title}</CardTitle>
              <div className={`p-1.5 md:p-2 rounded-lg ${alert.bgColor}`}>
                <alert.icon className={`h-4 w-4 md:h-5 md:w-5 ${alert.color}`} />
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
              <div className="text-lg md:text-2xl font-bold truncate">{alert.value}</div>
              {alert.action && (
                <p className="text-xs text-muted-foreground mt-1 hidden md:block">Click to view</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Orders</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/orders')}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No orders yet</p>
              ) : (
                recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex-1">
                      <p className="font-medium text-sm">Order #{order.id.slice(0, 8)}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.profiles?.full_name || 'Guest'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{formatKES(order.total_amount)}</p>
                      <Badge className={getStatusColor(order.status)} variant="secondary">
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Top Selling Products</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/products')}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No sales data yet</p>
              ) : (
                topProducts.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    {item.product?.images && item.product.images[0] && (
                      <img 
                        src={item.product.images[0]} 
                        alt={item.product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.product?.name}</p>
                      <p className="text-xs text-muted-foreground">{item.quantity} sold</p>
                    </div>
                    <p className="font-semibold text-sm">{formatKES(item.product?.price * item.quantity)}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Button variant="outline" onClick={() => navigate('/admin/products')} className="h-auto py-4 flex flex-col gap-2">
              <Package className="h-5 w-5" />
              <span className="text-sm">Products</span>
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin/orders')} className="h-auto py-4 flex flex-col gap-2">
              <ShoppingCart className="h-5 w-5" />
              <span className="text-sm">Orders</span>
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin/users')} className="h-auto py-4 flex flex-col gap-2">
              <Users className="h-5 w-5" />
              <span className="text-sm">Users</span>
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin/settings')} className="h-auto py-4 flex flex-col gap-2">
              <DollarSign className="h-5 w-5" />
              <span className="text-sm">Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
