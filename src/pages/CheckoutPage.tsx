import { useState, useEffect } from 'react';
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
import { ShoppingBag, MapPin, Upload, FileImage } from 'lucide-react';
import { ShippingCalculator } from '@/components/Product/ShippingCalculator';
import { Textarea } from '@/components/ui/textarea';
import { triggerPurchaseAnimation } from '@/components/Gamification/AddToCartAnimation';

const CheckoutPage = () => {
  const { user } = useAuth();
  const { items, getTotalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  
  const [paymentSettings, setPaymentSettings] = useState({
    paybill: '',
    businessName: '',
    accountNumber: ''
  });

  const [checkoutData, setCheckoutData] = useState({
    address: 'Kenya',
    city: '',
    county: '',
    isGuest: !user,
    guestName: '',
    guestEmail: '',
    transactionCode: '',
    screenshotFile: null as File | null,
    screenshotUrl: ''
  });

  useEffect(() => {
    fetchPaymentSettings();
  }, []);

  const fetchPaymentSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', ['mpesa_paybill', 'mpesa_business_name', 'mpesa_account_number']);

      if (error) throw error;

      const settings = data?.reduce((acc: any, { key, value }) => {
        if (key === 'mpesa_paybill') acc.paybill = value;
        if (key === 'mpesa_business_name') acc.businessName = value;
        if (key === 'mpesa_account_number') acc.accountNumber = value;
        return acc;
      }, {});

      setPaymentSettings(settings || paymentSettings);
    } catch (error: any) {
      toast({
        title: 'Error loading payment settings',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file',
        description: 'Please upload an image file',
        variant: 'destructive'
      });
      return;
    }

    setCheckoutData({ ...checkoutData, screenshotFile: file });
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate fields
    if (!user && (!checkoutData.guestName || !checkoutData.guestEmail)) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (!checkoutData.address || !checkoutData.city || !checkoutData.county) {
      toast({
        title: "Missing shipping information",
        description: "Please provide complete shipping address",
        variant: "destructive"
      });
      return;
    }

    if (!checkoutData.transactionCode && !checkoutData.screenshotFile) {
      toast({
        title: "Payment proof required",
        description: "Please provide transaction code or upload payment screenshot",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      let screenshotUrl = '';

      // Upload screenshot if provided
      if (checkoutData.screenshotFile) {
        setUploadingScreenshot(true);
        const fileExt = checkoutData.screenshotFile.name.split('.').pop();
        const fileName = `${user?.id || 'guest'}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('transaction-screenshots')
          .upload(fileName, checkoutData.screenshotFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('transaction-screenshots')
          .getPublicUrl(fileName);

        screenshotUrl = publicUrl;
        setUploadingScreenshot(false);
      }

      const fullAddress = `${checkoutData.address}, ${checkoutData.city}, ${checkoutData.county}, Kenya`;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id || null,
          guest_name: !user ? checkoutData.guestName : null,
          guest_email: !user ? checkoutData.guestEmail : null,
          total_amount: getTotalPrice(),
          shipping_address: fullAddress,
          phone: checkoutData.transactionCode, // Store transaction code in phone field temporarily
          mpesa_transaction_id: checkoutData.transactionCode || 'Screenshot provided',
          transaction_screenshot_url: screenshotUrl || null,
          status: 'pending',
          payment_status: 'pending',
          payment_method: 'mpesa'
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

      // Trigger celebration animation
      triggerPurchaseAnimation();

      toast({
        title: "Order submitted!",
        description: "Your order is pending admin verification. You'll be notified once approved.",
      });

      clearCart();
      
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
      console.error('Checkout error:', error);
      toast({
        title: "Checkout failed",
        description: error.message || "An error occurred during checkout. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setUploadingScreenshot(false);
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
              <CardTitle>Delivery & Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCheckout} className="space-y-6">
                {!user && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="guestName">Full Name *</Label>
                      <Input
                        id="guestName"
                        placeholder="John Doe"
                        value={checkoutData.guestName}
                        onChange={(e) => setCheckoutData({ ...checkoutData, guestName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guestEmail">Email Address *</Label>
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

                <Separator />
                
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Shipping Address (Kenya)
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="county">County *</Label>
                    <Input
                      id="county"
                      placeholder="e.g., Nairobi"
                      value={checkoutData.county}
                      onChange={e => setCheckoutData({ ...checkoutData, county: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City/Town *</Label>
                    <Input
                      id="city"
                      placeholder="e.g., Westlands"
                      value={checkoutData.city}
                      onChange={e => setCheckoutData({ ...checkoutData, city: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address *</Label>
                    <Textarea
                      id="address"
                      placeholder="Building name, floor, apartment number, street"
                      value={checkoutData.address}
                      onChange={e => setCheckoutData({ ...checkoutData, address: e.target.value })}
                      required
                      rows={3}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold">M-Pesa Payment</h3>
                  
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="pt-6 space-y-2">
                      <p className="text-sm"><strong>Paybill:</strong> {paymentSettings.paybill}</p>
                      <p className="text-sm"><strong>Business:</strong> {paymentSettings.businessName}</p>
                      <p className="text-sm"><strong>Account:</strong> {paymentSettings.accountNumber}</p>
                      <p className="text-sm"><strong>Amount:</strong> {formatKES(getTotalPrice())}</p>
                    </CardContent>
                  </Card>

                  <div className="space-y-2">
                    <Label htmlFor="transactionCode">M-Pesa Transaction Code</Label>
                    <Input
                      id="transactionCode"
                      placeholder="e.g., QGH7XYZABC"
                      value={checkoutData.transactionCode}
                      onChange={e => setCheckoutData({ ...checkoutData, transactionCode: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">Enter the code from your M-Pesa confirmation SMS</p>
                  </div>

                  <div className="text-center text-sm text-muted-foreground">OR</div>

                  <div className="space-y-2">
                    <Label htmlFor="screenshot">Upload Payment Screenshot</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="screenshot"
                        type="file"
                        accept="image/*"
                        onChange={handleScreenshotUpload}
                        className="cursor-pointer"
                      />
                      {checkoutData.screenshotFile && (
                        <FileImage className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Upload screenshot of M-Pesa confirmation message</p>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isProcessing || uploadingScreenshot}
                >
                  {uploadingScreenshot ? (
                    <>
                      <Upload className="mr-2 h-4 w-4 animate-spin" />
                      Uploading Screenshot...
                    </>
                  ) : isProcessing ? (
                    'Processing Order...'
                  ) : (
                    `Submit Order - ${formatKES(getTotalPrice())}`
                  )}
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
