import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import { formatKES } from '@/utils/currency';

interface CartSheetProps {
  trigger: React.ReactNode;
}

const CartSheet = ({ trigger }: CartSheetProps) => {
  const { items, updateQuantity, removeFromCart, getTotalPrice, getTotalItems } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleCheckout = () => {
    setOpen(false);
    navigate('/checkout');
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>
      
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0">
        <SheetHeader className="px-4 sm:px-6 pt-6 pb-4 border-b">
          <SheetTitle className="flex items-center justify-between text-base sm:text-lg">
            Shopping Cart
            <Badge variant="secondary" className="text-xs sm:text-sm">{getTotalItems()} items</Badge>
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col flex-1 overflow-hidden">
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center px-4">
              <div className="text-center">
                <p className="text-sm sm:text-base text-muted-foreground mb-4">Your cart is empty</p>
                <Button variant="outline" onClick={() => setOpen(false)} className="text-sm">Continue Shopping</Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
                <div className="space-y-3 sm:space-y-4">
                  {items.map((item) => (
                    <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex gap-3 p-3 border rounded-lg animate-fade-in">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded shrink-0"
                      />
                      
                      <div className="flex-1 min-w-0 flex flex-col">
                        <h4 className="font-medium text-sm sm:text-base truncate">{item.name}</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">{item.category}</p>
                        
                        <div className="flex gap-2 mt-1">
                          {item.selectedSize && (
                            <p className="text-xs text-muted-foreground">Size: {item.selectedSize}</p>
                          )}
                          {item.selectedColor && (
                            <p className="text-xs text-muted-foreground">Color: {item.selectedColor}</p>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between mt-auto pt-2">
                          <span className="font-semibold text-sm sm:text-base">{formatKES(item.price)}</span>
                          
                          <div className="flex items-center gap-1 sm:gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-7 w-7 sm:h-8 sm:w-8"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            
                            <span className="w-6 sm:w-8 text-center text-xs sm:text-sm">{item.quantity}</span>
                            
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-7 w-7 sm:h-8 sm:w-8"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 sm:h-8 sm:w-8 text-destructive"
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

              <div className="border-t px-4 sm:px-6 py-4 space-y-3 sm:space-y-4 bg-background">
                <div className="flex justify-between items-center">
                  <span className="text-base sm:text-lg font-semibold">Total:</span>
                  <span className="text-base sm:text-lg font-bold text-primary">
                    {formatKES(getTotalPrice())}
                  </span>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Button className="w-full text-sm sm:text-base h-10 sm:h-11" onClick={handleCheckout}>
                    Proceed to Checkout
                  </Button>
                  <p className="text-xs text-center text-muted-foreground px-2">
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
