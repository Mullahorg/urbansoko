import { Minus, Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/utils/currency';

interface CartSheetProps {
  trigger: React.ReactNode;
}

const CartSheet = ({ trigger }: CartSheetProps) => {
  const { items, updateQuantity, removeFromCart, getTotalPrice, getTotalItems } = useCart();

  const handleCheckout = () => {
    // This will be implemented when Supabase is connected for M-Pesa integration
    alert('Checkout functionality will be available once you connect to Supabase for M-Pesa payments');
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>
      
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            Shopping Cart
            <Badge variant="secondary">{getTotalItems()} items</Badge>
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">Your cart is empty</p>
                <Button variant="outline">Continue Shopping</Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-auto py-4">
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex gap-4 p-4 border rounded-lg">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">{item.category}</p>
                        
                        {item.selectedSize && (
                          <p className="text-xs text-muted-foreground">Size: {item.selectedSize}</p>
                        )}
                        {item.selectedColor && (
                          <p className="text-xs text-muted-foreground">Color: {item.selectedColor}</p>
                        )}
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-semibold text-sm">{formatPrice(item.price)}</span>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            
                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                            
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-destructive"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-lg font-bold text-primary">
                    {formatPrice(getTotalPrice())}
                  </span>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Button className="w-full" size="lg" onClick={handleCheckout}>
                    Checkout with M-Pesa
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Secure payment via M-Pesa • Free shipping over KSh 5,000
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;