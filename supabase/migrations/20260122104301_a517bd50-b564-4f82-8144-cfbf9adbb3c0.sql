-- Create stores table for multi-store marketplace
CREATE TABLE public.stores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT,
  logo_url TEXT,
  banner_url TEXT,
  rating NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'suspended')),
  phone TEXT,
  email TEXT,
  address TEXT,
  delivery_enabled BOOLEAN DEFAULT true,
  pickup_enabled BOOLEAN DEFAULT true,
  min_order_amount NUMERIC DEFAULT 0,
  delivery_fee NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create store sections table
CREATE TABLE public.store_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT DEFAULT 'product' CHECK (type IN ('food', 'beverage', 'product', 'service')),
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add store_id and section_id to products table
ALTER TABLE public.products 
  ADD COLUMN store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  ADD COLUMN section_id UUID REFERENCES public.store_sections(id) ON DELETE SET NULL,
  ADD COLUMN is_perishable BOOLEAN DEFAULT false,
  ADD COLUMN expiry_date TIMESTAMP WITH TIME ZONE,
  ADD COLUMN tags TEXT[] DEFAULT '{}',
  ADD COLUMN options JSONB DEFAULT '[]';

-- Add store_id to orders table for multi-store support
ALTER TABLE public.orders
  ADD COLUMN store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
  ADD COLUMN delivery_type TEXT DEFAULT 'delivery' CHECK (delivery_type IN ('pickup', 'delivery')),
  ADD COLUMN delivery_fee NUMERIC DEFAULT 0,
  ADD COLUMN subtotal NUMERIC,
  ADD COLUMN tax NUMERIC DEFAULT 0,
  ADD COLUMN delivery_time TIMESTAMP WITH TIME ZONE;

-- Enable RLS on new tables
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_sections ENABLE ROW LEVEL SECURITY;

-- Stores policies
CREATE POLICY "Anyone can view active stores" 
ON public.stores 
FOR SELECT 
USING (status = 'active' OR owner_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Vendors can create their own store" 
ON public.stores 
FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Store owners can update their store" 
ON public.stores 
FOR UPDATE 
USING (auth.uid() = owner_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete stores" 
ON public.stores 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'));

-- Store sections policies
CREATE POLICY "Anyone can view active sections" 
ON public.store_sections 
FOR SELECT 
USING (
  is_active = true OR 
  EXISTS (SELECT 1 FROM stores WHERE stores.id = store_sections.store_id AND stores.owner_id = auth.uid()) OR
  has_role(auth.uid(), 'admin')
);

CREATE POLICY "Store owners can manage their sections" 
ON public.store_sections 
FOR ALL 
USING (
  EXISTS (SELECT 1 FROM stores WHERE stores.id = store_sections.store_id AND stores.owner_id = auth.uid()) OR
  has_role(auth.uid(), 'admin')
);

-- Update products policies for store ownership
CREATE POLICY "Store owners can manage their products" 
ON public.products 
FOR ALL 
USING (
  EXISTS (SELECT 1 FROM stores WHERE stores.id = products.store_id AND stores.owner_id = auth.uid())
);

-- Add realtime for stores
ALTER PUBLICATION supabase_realtime ADD TABLE public.stores;
ALTER PUBLICATION supabase_realtime ADD TABLE public.store_sections;

-- Create triggers for updated_at
CREATE TRIGGER update_stores_updated_at
  BEFORE UPDATE ON public.stores
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_store_sections_updated_at
  BEFORE UPDATE ON public.store_sections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for performance
CREATE INDEX idx_stores_owner ON public.stores(owner_id);
CREATE INDEX idx_stores_status ON public.stores(status);
CREATE INDEX idx_stores_slug ON public.stores(slug);
CREATE INDEX idx_store_sections_store ON public.store_sections(store_id);
CREATE INDEX idx_products_store ON public.products(store_id);
CREATE INDEX idx_products_section ON public.products(section_id);
CREATE INDEX idx_orders_store ON public.orders(store_id);