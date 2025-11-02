import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { formatKES } from '@/utils/currency';
import { supabase } from '@/integrations/supabase/client';
import { ShoppingBag, Phone, MapPin } from 'lucide-react';
import { ShippingCalculator } from '@/components/Product/ShippingCalculator';

const CheckoutPage = () => {
  const { user } = useAuth();
  const { items, getTotalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [checkoutData, setCheckoutData] = useState({
    phone: '',
    address: '',
    isGuest: !user,
    guestName: '',
    guestEmail: '',
  });

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate guest checkout fields
    if (!user) {
      if (!checkoutData.guestName || !checkoutData.guestEmail || !checkoutData.phone || !checkoutData.address) {
        toast({
          title: "Missing information",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }
    } else {
      if (!checkoutData.phone || !checkoutData.address) {
        toast({
          title: "Missing information",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }
    }

    setIsProcessing(true);

    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id || null,
          guest_name: !user ? checkoutData.guestName : null,
          guest_email: !user ? checkoutData.guestEmail : null,
          total_amount: getTotalPrice(),
          shipping_address: checkoutData.address,
          phone: checkoutData.phone,
          status: 'pending',
          payment_status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
        selected_size: item.selectedSize,
        selected_color: item.selectedColor
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Call M-Pesa STK Push
      const { data: mpesaResponse, error: mpesaError } = await supabase.functions.invoke(
        'mpesa-stk-push',
        {
          body: {
            phone: checkoutData.phone,
            amount: getTotalPrice(),
            orderId: order.id
          }
        }
      );

      if (mpesaError) {
        console.error('M-Pesa error:', mpesaError);
      }

      toast({
        title: "Order placed!",
        description: mpesaResponse?.demo 
          ? "Demo mode: Payment will be confirmed in 3 seconds" 
          : "Check your phone for M-Pesa prompt",
      });

      clearCart();
      
      // Show tracking code
      toast({
        title: "Track your order",
        description: `Your tracking code: ${order.tracking_code}`,
        duration: 10000,
      });

      if (!user) {
        navigate(`/track-order?code=${order.tracking_code}`);
      } else {
        navigate('/orders');
      }
    } catch (error: any) {
      toast({
        title: "Checkout failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <Button onClick={() => navigate('/')}>Continue Shopping</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-2xl md:text-3xl font-bold mb-8">Checkout</h1>
      
      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCheckout} className="space-y-4">
                {!user && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="guestName">Full Name</Label>
                      <Input
                        id="guestName"
                        placeholder="John Doe"
                        value={checkoutData.guestName}
                        onChange={(e) => setCheckoutData({ ...checkoutData, guestName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guestEmail">Email Address</Label>
                      <Input
                        id="guestEmail"
                        type="email"
                        placeholder="john@example.com"
                        value={checkoutData.guestEmail}
                        onChange={(e) => setCheckoutData({ ...checkoutData, guestEmail: e.target.value })}
                        required
                      />
                    </div>
                  </>
                )}
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    <Phone className="inline w-4 h-4 mr-2" />
                    M-Pesa Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="0712345678"
                    value={checkoutData.phone}
                    onChange={e => setCheckoutData({ ...checkoutData, phone: e.target.value })}
                    required
                  />
                  <p className="text-sm text-muted-foreground">Enter your M-Pesa number for payment</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">
                    <MapPin className="inline w-4 h-4 mr-2" />
                    Delivery Address
                  </Label>
                  <Input
                    id="address"
                    type="text"
                    placeholder="Enter your full delivery address"
                    value={checkoutData.address}
                    onChange={e => setCheckoutData({ ...checkoutData, address: e.target.value })}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isProcessing}>
                  {isProcessing ? 'Processing...' : `Pay ${formatKES(getTotalPrice())} via M-Pesa`}
                </Button>
                
                {!user && (
                  <p className="text-xs text-center text-muted-foreground">
                    You'll receive an order tracking code after checkout
                  </p>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Shipping Calculator */}
          <ShippingCalculator subtotal={getTotalPrice()} />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map(item => (
                <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex justify-between text-sm">
                  <span>{item.name} x {item.quantity}</span>
                  <span>{formatKES(item.price * item.quantity)}</span>
                </div>
              ))}
              
              <Separator />
              
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatKES(getTotalPrice())}</span>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p>• Free delivery within Nairobi</p>
                <p>• Delivery within 2-3 business days</p>
                <p>• Secure M-Pesa payment</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
