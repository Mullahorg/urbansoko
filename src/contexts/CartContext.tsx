import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Product } from '@/components/Product/ProductCard';
import { useToast } from '@/hooks/use-toast';

// Military-grade storage wrapper
const SafeStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Silently fail
    }
  },
};

interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, size?: string, color?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const savedCart = SafeStorage.getItem('cart');
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        // Validate cart structure
        if (Array.isArray(parsed) && parsed.every(item => item.id && typeof item.price === 'number')) {
          return parsed;
        }
      }
    } catch {
      // Invalid cart data, start fresh
    }
    return [];
  });
  const { toast } = useToast();

  // Persist cart to localStorage whenever it changes with validation
  useEffect(() => {
    if (items.length === 0) {
      SafeStorage.removeItem('cart');
    } else {
      SafeStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items]);

  const addToCart = (product: Product, size?: string, color?: string) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(
        item => item.id === product.id && 
        item.selectedSize === size && 
        item.selectedColor === color
      );

      if (existingItem) {
        toast({
          title: "Item Updated",
          description: `${product.name} quantity increased in cart`,
        });
        return prevItems.map(item =>
          item.id === product.id && 
          item.selectedSize === size && 
          item.selectedColor === color
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart`,
      });

      return [...prevItems, { 
        ...product, 
        quantity: 1, 
        selectedSize: size, 
        selectedColor: color 
      }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== productId));
    toast({
      title: "Item Removed",
      description: "Item has been removed from your cart",
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = useCallback(() => {
    setItems([]);
    SafeStorage.removeItem('cart');
    toast({
      title: "Cart Cleared",
      description: "All items have been removed from your cart",
    });
  }, [toast]);

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalPrice,
      getTotalItems
    }}>
      {children}
    </CartContext.Provider>
  );
};