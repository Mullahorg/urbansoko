import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { Package, Truck, CheckCircle, Clock, Search } from 'lucide-react';
import { formatKES } from '@/utils/currency';
import { Badge } from '@/components/ui/badge';

interface OrderDetails {
  id: string;
  tracking_code: string;
  created_at: string;
  status: string;
  payment_status: string;
  total_amount: number;
  shipping_address: string;
  phone: string;
  guest_name?: string;
  guest_email?: string;
}

interface StatusHistory {
  status: string;
  created_at: string;
  notes?: string;
}

const OrderTrackingPage = () => {
  const [trackingCode, setTrackingCode] = useState('');
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [statusHistory, setStatusHistory] = useState<StatusHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const trackOrder = async () => {
    setLoading(true);
    setError('');
    setOrder(null);

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('tracking_code', trackingCode.trim())
      .single();

    if (orderError || !orderData) {
      setError('Order not found. Please check your tracking code.');
      setLoading(false);
      return;
    }

    setOrder(orderData);

    // Fetch status history
    const { data: historyData } = await supabase
      .from('order_status_history')
      .select('status, created_at, notes')
      .eq('order_id', orderData.id)
      .order('created_at', { ascending: false });

    if (historyData) {
      setStatusHistory(historyData);
    }

    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return <CheckCircle className="w-8 h-8 text-success" />;
      case 'processing':
      case 'shipped':
        return <Truck className="w-8 h-8 text-primary" />;
      case 'pending':
        return <Clock className="w-8 h-8 text-warning" />;
      default:
        return <Package className="w-8 h-8 text-muted-foreground" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Track Your Order</h1>

      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="tracking">Tracking Code</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="tracking"
                  placeholder="Enter your tracking code (e.g., abc123def456)"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && trackOrder()}
                />
                <Button onClick={trackOrder} disabled={loading || !trackingCode.trim()}>
                  <Search className="mr-2 h-4 w-4" />
                  Track
                </Button>
              </div>
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {order && (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="font-medium">#{order.id.slice(0, 8)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tracking Code</p>
                  <p className="font-medium">{order.tracking_code}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Order Date</p>
                  <p className="font-medium">
                    {new Date(order.created_at).toLocaleDateString('en-KE', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="font-bold text-lg">{formatKES(order.total_amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">{order.guest_name || 'Registered User'}</p>
                  {order.guest_email && (
                    <p className="text-sm text-muted-foreground">{order.guest_email}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{order.phone}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-muted-foreground">Delivery Address</p>
                  <p className="font-medium">{order.shipping_address}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Order Status</p>
                  <Badge variant="secondary" className="mt-1">{order.status}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Status</p>
                  <Badge 
                    variant={order.payment_status === 'completed' ? 'default' : 'outline'}
                    className="mt-1"
                  >
                    {order.payment_status === 'completed' ? 'Paid' : 'Pending'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {statusHistory.length > 0 ? (
                  statusHistory.map((item, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0">
                        {getStatusIcon(item.status)}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold capitalize">{item.status}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(item.created_at).toLocaleString('en-KE')}
                        </p>
                        {item.notes && (
                          <p className="text-sm mt-1">{item.notes}</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-4">
                    {getStatusIcon(order.status)}
                    <div>
                      <p className="font-semibold capitalize">{order.status}</p>
                      <p className="text-sm text-muted-foreground">Current status</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default OrderTrackingPage;
