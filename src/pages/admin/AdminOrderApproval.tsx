import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { formatKES } from '@/utils/currency';
import { Check, X, Eye, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Order {
  id: string;
  tracking_code: string;
  total_amount: number;
  shipping_address: string;
  mpesa_transaction_id: string;
  transaction_screenshot_url: string | null;
  status: string;
  payment_status: string;
  created_at: string;
  guest_name: string | null;
  guest_email: string | null;
  order_items: any[];
}

const AdminOrderApproval = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  const fetchPendingOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products:product_id (name, price, image_url)
          )
        `)
        .eq('payment_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      toast({
        title: 'Error loading orders',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          payment_status: 'completed',
          status: 'processing'
        })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: 'Order approved',
        description: 'Payment verified and order is now processing'
      });

      fetchPendingOrders();
    } catch (error: any) {
      toast({
        title: 'Error approving order',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleReject = async (orderId: string) => {
    if (!confirm('Are you sure you want to reject this order?')) return;

    try {
      const { error } = await supabase
        .from('orders')
        .update({
          payment_status: 'failed',
          status: 'cancelled'
        })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: 'Order rejected',
        description: 'Order has been cancelled'
      });

      fetchPendingOrders();
    } catch (error: any) {
      toast({
        title: 'Error rejecting order',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Pending Order Approvals</h2>
        <p className="text-muted-foreground">Review and approve M-Pesa transactions</p>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No pending orders to review
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      Order #{order.tracking_code}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="secondary">Pending Review</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold">Customer</p>
                    <p className="text-sm text-muted-foreground">
                      {order.guest_name || 'Registered User'}
                    </p>
                    {order.guest_email && (
                      <p className="text-sm text-muted-foreground">{order.guest_email}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Total Amount</p>
                    <p className="text-lg font-bold text-primary">
                      {formatKES(order.total_amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Transaction Code</p>
                    <p className="text-sm font-mono">
                      {order.mpesa_transaction_id || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Shipping Address</p>
                    <p className="text-sm text-muted-foreground">
                      {order.shipping_address}
                    </p>
                  </div>
                </div>

                {order.transaction_screenshot_url && (
                  <div>
                    <p className="text-sm font-semibold mb-2">Payment Screenshot</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(order.transaction_screenshot_url!, '_blank')}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Screenshot
                    </Button>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Items
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleApprove(order.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Approve Payment
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleReject(order.id)}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Items</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {selectedOrder?.order_items.map((item: any, idx: number) => (
              <div key={idx} className="flex gap-4 items-center border-b pb-4">
                {item.products?.image_url && (
                  <img
                    src={item.products.image_url}
                    alt={item.products?.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <p className="font-semibold">{item.products?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Qty: {item.quantity} × {formatKES(item.price)}
                  </p>
                  {item.selected_size && (
                    <p className="text-xs text-muted-foreground">
                      Size: {item.selected_size}
                    </p>
                  )}
                  {item.selected_color && (
                    <p className="text-xs text-muted-foreground">
                      Color: {item.selected_color}
                    </p>
                  )}
                </div>
                <p className="font-bold">
                  {formatKES(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrderApproval;
