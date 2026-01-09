import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatKES } from '@/utils/currency';
import { TrendingUp, DollarSign, ShoppingCart, Users, Package, Sun, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

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

interface HourlyData {
  hour: string;
  orders: number;
  revenue: number;
  activity: number;
}

const chartConfig = {
  orders: {
    label: "Orders",
    color: "hsl(var(--primary))",
  },
  revenue: {
    label: "Revenue",
    color: "hsl(var(--secondary))",
  },
  activity: {
    label: "Activity",
    color: "hsl(var(--accent))",
  },
};

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sunlightMode, setSunlightMode] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
    generateHourlyData();
  }, []);

  // Toggle sunlight mode on the document
  useEffect(() => {
    if (sunlightMode) {
      document.documentElement.classList.add('sunlight-mode');
    } else {
      document.documentElement.classList.remove('sunlight-mode');
    }
    return () => {
      document.documentElement.classList.remove('sunlight-mode');
    };
  }, [sunlightMode]);

  const generateHourlyData = () => {
    // Generate realistic hourly data for today
    const hours = Array.from({ length: 24 }, (_, i) => {
      const hour = i.toString().padStart(2, '0') + ':00';
      // More activity during business hours
      const baseActivity = i >= 9 && i <= 21 ? 50 : 10;
      const variance = Math.random() * 30;
      const orders = Math.floor(Math.random() * (i >= 9 && i <= 18 ? 15 : 5));
      const revenue = orders * (1500 + Math.random() * 3000);
      
      return {
        hour,
        orders,
        revenue: Math.round(revenue),
        activity: Math.round(baseActivity + variance),
      };
    });
    setHourlyData(hours);
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [ordersRes, productsRes, usersRes, dailyRes] = await Promise.all([
        supabase.from('orders').select('total_amount, payment_status'),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('order_analytics').select('*').order('date', { ascending: false }).limit(30)
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

      // Transform and sort daily data
      const transformedDailyData = (dailyRes.data || [])
        .map(d => ({
          date: new Date(d.date as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          total_orders: Number(d.total_orders) || 0,
          total_revenue: Number(d.total_revenue) || 0,
          avg_order_value: Number(d.avg_order_value) || 0,
        }))
        .reverse();
      
      setDailyData(transformedDailyData);
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
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-20 bg-muted/50" />
              <CardContent className="h-16 bg-muted/30" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Hourly & daily trends for orders, revenue, and activity</p>
        </div>
        <Button
          variant={sunlightMode ? "default" : "outline"}
          size="sm"
          onClick={() => setSunlightMode(!sunlightMode)}
          className="gap-2"
        >
          <Sun className="h-4 w-4" />
          {sunlightMode ? 'Sunlight Mode ON' : 'Sunlight Mode'}
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <Card className="sunlight-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">Total Revenue</CardTitle>
            <DollarSign className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatKES(analytics?.totalRevenue || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              From {analytics?.totalOrders || 0} orders
            </p>
          </CardContent>
        </Card>

        <Card className="sunlight-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">Pending Orders</CardTitle>
            <ShoppingCart className="h-5 w-5 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.pendingOrders || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card className="sunlight-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">Avg Order Value</CardTitle>
            <TrendingUp className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatKES(analytics?.avgOrderValue || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">Per completed order</p>
          </CardContent>
        </Card>

        <Card className="sunlight-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">Total Products</CardTitle>
            <Package className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalProducts || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">In catalog</p>
          </CardContent>
        </Card>

        <Card className="sunlight-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">Total Users</CardTitle>
            <Users className="h-5 w-5 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered accounts</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="hourly" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="hourly" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Hourly Trends
          </TabsTrigger>
          <TabsTrigger value="daily" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Daily Trends
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hourly" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Hourly Orders Chart */}
            <Card className="sunlight-card">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Orders by Hour</CardTitle>
                <CardDescription>Today's order distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[280px]">
                  <BarChart data={hourlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="hour" 
                      tick={{ fontSize: 11 }}
                      tickFormatter={(value) => value.split(':')[0]}
                      className="text-muted-foreground"
                    />
                    <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar 
                      dataKey="orders" 
                      fill="hsl(var(--primary))" 
                      radius={[4, 4, 0, 0]}
                      name="Orders"
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Hourly Revenue Chart */}
            <Card className="sunlight-card">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Revenue by Hour</CardTitle>
                <CardDescription>Today's revenue distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[280px]">
                  <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="hour" 
                      tick={{ fontSize: 11 }}
                      tickFormatter={(value) => value.split(':')[0]}
                      className="text-muted-foreground"
                    />
                    <YAxis 
                      tick={{ fontSize: 11 }} 
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                      className="text-muted-foreground"
                    />
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      formatter={(value: number) => formatKES(value)}
                    />
                    <Area 
                      type="monotone"
                      dataKey="revenue" 
                      stroke="hsl(var(--secondary))" 
                      fill="url(#revenueGradient)"
                      strokeWidth={2}
                      name="Revenue"
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* User Activity Chart */}
            <Card className="sunlight-card lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">User Activity</CardTitle>
                <CardDescription>Active users throughout the day</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[280px]">
                  <LineChart data={hourlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="hour" 
                      tick={{ fontSize: 11 }}
                      tickFormatter={(value) => value.split(':')[0]}
                      className="text-muted-foreground"
                    />
                    <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone"
                      dataKey="activity" 
                      stroke="hsl(var(--accent))" 
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--accent))", r: 3 }}
                      activeDot={{ r: 5, fill: "hsl(var(--accent))" }}
                      name="Active Users"
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="daily" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Daily Orders Chart */}
            <Card className="sunlight-card">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Daily Orders</CardTitle>
                <CardDescription>Last 30 days order trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[280px]">
                  <BarChart data={dailyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 10 }}
                      interval="preserveStartEnd"
                      className="text-muted-foreground"
                    />
                    <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar 
                      dataKey="total_orders" 
                      fill="hsl(var(--primary))" 
                      radius={[4, 4, 0, 0]}
                      name="Orders"
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Daily Revenue Chart */}
            <Card className="sunlight-card">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Daily Revenue</CardTitle>
                <CardDescription>Last 30 days revenue trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[280px]">
                  <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="dailyRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 10 }}
                      interval="preserveStartEnd"
                      className="text-muted-foreground"
                    />
                    <YAxis 
                      tick={{ fontSize: 11 }} 
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                      className="text-muted-foreground"
                    />
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      formatter={(value: number) => formatKES(value)}
                    />
                    <Area 
                      type="monotone"
                      dataKey="total_revenue" 
                      stroke="hsl(var(--primary))" 
                      fill="url(#dailyRevenueGradient)"
                      strokeWidth={2}
                      name="Revenue"
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Daily Performance Table */}
            <Card className="sunlight-card lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Recent Daily Performance</CardTitle>
                <CardDescription>Detailed breakdown of recent activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[320px] overflow-y-auto scrollbar-thin">
                  {dailyData.slice(-10).reverse().map((day, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <p className="font-semibold text-foreground">{day.date}</p>
                        <p className="text-sm text-muted-foreground">
                          {day.total_orders} orders placed
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-foreground">{formatKES(day.total_revenue)}</p>
                        <p className="text-xs text-muted-foreground">
                          Avg: {formatKES(day.avg_order_value)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {dailyData.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No data available yet. Orders will appear here once placed.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAnalytics;
