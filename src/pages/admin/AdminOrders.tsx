import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatKES } from '@/utils/currency';
import { useToast } from '@/hooks/use-toast';

const AdminOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, profiles(email, full_name)')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setOrders(data);
    }
    setLoading(false);
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (!error) {
      toast({ title: 'Order status updated' });
      fetchOrders();
    } else {
      toast({
        title: 'Error updating order',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const updatePaymentStatus = async (orderId: string, paymentStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ payment_status: paymentStatus })
      .eq('id', orderId);

    if (!error) {
      toast({ title: 'Payment status updated' });
      fetchOrders();
    } else {
      toast({
        title: 'Error updating payment',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 max-w-full overflow-x-hidden">
      <div>
        <h2 className="text-xl md:text-3xl font-bold">Orders</h2>
        <p className="text-sm md:text-base text-muted-foreground">Manage customer orders</p>
      </div>

      <div className="space-y-3 md:space-y-4">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardHeader className="p-3 md:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                <div className="min-w-0">
                  <CardTitle className="text-base md:text-lg truncate">Order #{order.id.slice(0, 8)}</CardTitle>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1 truncate">
                    {order.profiles?.email || 'Unknown customer'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="sm:text-right">
                  <p className="text-lg md:text-xl font-bold text-primary">
                    {formatKES(order.total_amount)}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0 md:pt-0 space-y-3 md:space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div className="min-w-0">
                  <p className="text-xs md:text-sm text-muted-foreground">Phone</p>
                  <p className="text-sm md:text-base font-medium truncate">{order.phone}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-xs md:text-sm text-muted-foreground">Delivery Address</p>
                  <p className="text-sm md:text-base font-medium break-words">{order.shipping_address}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <div className="flex-1 min-w-0">
                  <Label className="text-xs md:text-sm text-muted-foreground mb-1 block">Order Status</Label>
                  <Select
                    value={order.status}
                    onValueChange={(value) => updateOrderStatus(order.id, value)}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 min-w-0">
                  <Label className="text-xs md:text-sm text-muted-foreground mb-1 block">Payment Status</Label>
                  <Select
                    value={order.payment_status}
                    onValueChange={(value) => updatePaymentStatus(order.id, value)}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const Label = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <label className={className}>{children}</label>
);

export default AdminOrders;
