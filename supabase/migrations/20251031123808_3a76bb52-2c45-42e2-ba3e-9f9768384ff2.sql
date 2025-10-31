-- Add guest checkout fields to orders table
ALTER TABLE orders
ADD COLUMN guest_email TEXT,
ADD COLUMN guest_name TEXT,
ADD COLUMN tracking_code TEXT UNIQUE DEFAULT substring(md5(random()::text) from 1 for 12);

-- Create index for tracking code lookup
CREATE INDEX idx_orders_tracking_code ON orders(tracking_code);

-- Create rewards/points system
CREATE TABLE user_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  points INTEGER DEFAULT 0 NOT NULL,
  total_earned INTEGER DEFAULT 0 NOT NULL,
  level INTEGER DEFAULT 1 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX idx_user_rewards_user_id ON user_rewards(user_id);

-- Enable RLS on user_rewards
ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own rewards"
  ON user_rewards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own rewards"
  ON user_rewards FOR UPDATE
  USING (auth.uid() = user_id);

-- Create rewards history
CREATE TABLE rewards_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE rewards_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own rewards history"
  ON rewards_history FOR SELECT
  USING (auth.uid() = user_id);

-- Create vendors table
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_name TEXT NOT NULL,
  business_description TEXT,
  business_logo TEXT,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  commission_rate NUMERIC DEFAULT 10.0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved vendors"
  ON vendors FOR SELECT
  USING (status = 'approved' OR auth.uid() = user_id);

CREATE POLICY "Users can create vendor profiles"
  ON vendors FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Vendors can update their own profile"
  ON vendors FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all vendors"
  ON vendors FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add vendor_id to products table
ALTER TABLE products
ADD COLUMN vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL;

-- Create order status history
CREATE TABLE order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their order status history"
  ON order_status_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_status_history.order_id
      AND (orders.user_id = auth.uid() OR auth.uid() IS NULL)
    )
  );

CREATE POLICY "Admins can manage order status history"
  ON order_status_history FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create function to automatically track order status changes
CREATE OR REPLACE FUNCTION track_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO order_status_history (order_id, status, notes)
    VALUES (NEW.id, NEW.status, 'Status updated');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER order_status_change_trigger
AFTER UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION track_order_status_change();

-- Create function to award points on order completion
CREATE OR REPLACE FUNCTION award_points_on_order()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.payment_status IS DISTINCT FROM NEW.payment_status 
      AND NEW.payment_status = 'completed' AND NEW.user_id IS NOT NULL) THEN
    
    -- Award 1 point per 100 KES spent
    INSERT INTO user_rewards (user_id, points, total_earned)
    VALUES (NEW.user_id, FLOOR(NEW.total_amount / 100), FLOOR(NEW.total_amount / 100))
    ON CONFLICT (user_id) DO UPDATE
    SET points = user_rewards.points + FLOOR(NEW.total_amount / 100),
        total_earned = user_rewards.total_earned + FLOOR(NEW.total_amount / 100),
        level = FLOOR((user_rewards.total_earned + FLOOR(NEW.total_amount / 100)) / 1000) + 1,
        updated_at = now();
    
    -- Record in history
    INSERT INTO rewards_history (user_id, points, reason, order_id)
    VALUES (NEW.user_id, FLOOR(NEW.total_amount / 100), 'Order completed', NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER award_points_trigger
AFTER UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION award_points_on_order();

-- Update products stock trigger
CREATE OR REPLACE FUNCTION decrease_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET stock = stock - NEW.quantity
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER decrease_stock_trigger
AFTER INSERT ON order_items
FOR EACH ROW
EXECUTE FUNCTION decrease_product_stock();

-- Update RLS policies for guest checkout
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON orders;

CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

-- Allow order items for guest checkout
DROP POLICY IF EXISTS "Users can create order items" ON order_items;

CREATE POLICY "Anyone can create order items"
  ON order_items FOR INSERT
  WITH CHECK (true);