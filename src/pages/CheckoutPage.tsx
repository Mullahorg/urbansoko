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
import { Textarea } from '@/components/ui/textarea';
import { triggerPurchaseAnimation } from '@/components/Gamification/AddToCartAnimation';
import { useIntegratedAnalytics } from '@/hooks/useIntegratedAnalytics';

const CheckoutPage = () => {
  const { user } = useAuth();
  const { items, getTotalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const { trackPurchase } = useIntegratedAnalytics();

  const [paymentSettings, setPaymentSettings] = useState({
    paybill: '', businessName: '', accountNumber: ''
  });

  const [checkoutData, setCheckoutData] = useState({
    address: '',
    city: '',
    county: '',
    phone: '',
    guestName: '',
    guestEmail: '',
    transactionCode: '',
    screenshotFile: null as File | null,
  });

  useEffect(() => { fetchPaymentSettings(); }, []);

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
      toast({ title: 'Error loading payment settings', description: error.message, variant: 'destructive' });
    }
  };

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please upload an image', variant: 'destructive' });
      return;
    }
    setCheckoutData({ ...checkoutData, screenshotFile: file });
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user && (!checkoutData.guestName || !checkoutData.guestEmail)) {
      toast({ title: "Missing information", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    if (!checkoutData.phone || !checkoutData.address || !checkoutData.city || !checkoutData.county) {
      toast({ title: "Missing shipping information", description: "Please provide complete shipping address and phone number", variant: "destructive" });
      return;
    }
    if (!checkoutData.transactionCode && !checkoutData.screenshotFile) {
      toast({ title: "Payment proof required", description: "Please provide transaction code or upload payment screenshot", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      let screenshotUrl = '';
      if (checkoutData.screenshotFile) {
        setUploadingScreenshot(true);
        const fileExt = checkoutData.screenshotFile.name.split('.').pop();
        const fileName = `${user?.id || 'guest'}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('store-assets').upload(`screenshots/${fileName}`, checkoutData.screenshotFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('store-assets').getPublicUrl(`screenshots/${fileName}`);
        screenshotUrl = publicUrl;
        setUploadingScreenshot(false);
      }

      const fullAddress = `${checkoutData.address}, ${checkoutData.city}, ${checkoutData.county}, Kenya`;

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id || null,
          guest_name: !user ? checkoutData.guestName : null,
          guest_email: !user ? checkoutData.guestEmail : null,
          total_amount: getTotalPrice(),
          shipping_address: fullAddress,
          phone: checkoutData.phone,
          mpesa_transaction_id: checkoutData.transactionCode || 'Screenshot provided',
          transaction_screenshot_url: screenshotUrl || null,
          status: 'pending',
          payment_status: 'pending',
          payment_method: 'mpesa',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
        selected_size: item.selectedSize,
        selected_color: item.selectedColor,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      triggerPurchaseAnimation();
      trackPurchase({ orderId: order.id, totalAmount: getTotalPrice(), itemCount: items.length, paymentMethod: 'mpesa' });

      toast({ title: "Order submitted!", description: "Your order is pending payment verification." });
      clearCart();
      toast({ title: "Track your order", description: `Tracking code: ${order.tracking_code}`, duration: 10000 });

      if (!user) {
        navigate(`/track-order?code=${order.tracking_code}`);
      } else {
        navigate('/orders');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({ title: "Checkout failed", description: error.message || "An error occurred.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
      setUploadingScreenshot(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
        <p className="text-sm text-muted-foreground mb-4">Add items to get started.</p>
        <Button onClick={() => navigate('/')}>Continue Shopping</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-2xl font-semibold mb-6">Checkout</h1>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Delivery & Payment</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleCheckout} className="space-y-5">
                {!user && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="guestName" className="text-sm">Full Name *</Label>
                      <Input id="guestName" placeholder="John Doe" value={checkoutData.guestName} onChange={(e) => setCheckoutData({ ...checkoutData, guestName: e.target.value })} required />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="guestEmail" className="text-sm">Email *</Label>
                      <Input id="guestEmail" type="email" placeholder="john@example.com" value={checkoutData.guestEmail} onChange={(e) => setCheckoutData({ ...checkoutData, guestEmail: e.target.value })} required />
                    </div>
                  </div>
                )}

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium text-sm flex items-center gap-2"><MapPin className="w-4 h-4" />Shipping Address</h3>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-sm">Phone Number *</Label>
                    <Input id="phone" type="tel" placeholder="0712 345 678" value={checkoutData.phone} onChange={e => setCheckoutData({ ...checkoutData, phone: e.target.value })} required />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="county" className="text-sm">County *</Label>
                      <Input id="county" placeholder="Nairobi" value={checkoutData.county} onChange={e => setCheckoutData({ ...checkoutData, county: e.target.value })} required />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="city" className="text-sm">City/Town *</Label>
                      <Input id="city" placeholder="Westlands" value={checkoutData.city} onChange={e => setCheckoutData({ ...checkoutData, city: e.target.value })} required />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="address" className="text-sm">Street Address *</Label>
                    <Textarea id="address" placeholder="Building, floor, street" value={checkoutData.address} onChange={e => setCheckoutData({ ...checkoutData, address: e.target.value })} required rows={2} />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium text-sm">M-Pesa Payment</h3>
                  <Card className="bg-muted/50 border-border">
                    <CardContent className="pt-4 space-y-1 text-sm">
                      <p><span className="text-muted-foreground">Paybill:</span> <strong>{paymentSettings.paybill || '—'}</strong></p>
                      <p><span className="text-muted-foreground">Business:</span> <strong>{paymentSettings.businessName || '—'}</strong></p>
                      <p><span className="text-muted-foreground">Account:</span> <strong>{paymentSettings.accountNumber || '—'}</strong></p>
                      <p><span className="text-muted-foreground">Amount:</span> <strong>{formatKES(getTotalPrice())}</strong></p>
                    </CardContent>
                  </Card>

                  <div className="space-y-1.5">
                    <Label htmlFor="transactionCode" className="text-sm">M-Pesa Transaction Code</Label>
                    <Input id="transactionCode" placeholder="QGH7XYZABC" value={checkoutData.transactionCode} onChange={e => setCheckoutData({ ...checkoutData, transactionCode: e.target.value })} />
                    <p className="text-xs text-muted-foreground">From your M-Pesa confirmation SMS</p>
                  </div>

                  <div className="text-center text-xs text-muted-foreground">OR</div>

                  <div className="space-y-1.5">
                    <Label htmlFor="screenshot" className="text-sm">Upload Payment Screenshot</Label>
                    <div className="flex items-center gap-2">
                      <Input id="screenshot" type="file" accept="image/*" onChange={handleScreenshotUpload} className="cursor-pointer text-sm" />
                      {checkoutData.screenshotFile && <FileImage className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full h-11" disabled={isProcessing || uploadingScreenshot}>
                  {uploadingScreenshot ? (
                    <><Upload className="mr-2 h-4 w-4 animate-spin" />Uploading...</>
                  ) : isProcessing ? 'Processing...' : `Submit Order — ${formatKES(getTotalPrice())}`}
                </Button>

                {!user && <p className="text-xs text-center text-muted-foreground">You'll receive a tracking code after checkout</p>}
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="sticky top-20">
            <CardHeader><CardTitle className="text-base">Order Summary</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {items.map(item => (
                <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.name} × {item.quantity}</span>
                  <span>{formatKES(item.price * item.quantity)}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatKES(getTotalPrice())}</span>
              </div>
              <div className="text-xs text-muted-foreground space-y-1 pt-2">
                <p>• Free delivery within Nairobi</p>
                <p>• 2-3 business days delivery</p>
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
