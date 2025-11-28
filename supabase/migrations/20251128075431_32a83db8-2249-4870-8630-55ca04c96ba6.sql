-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create gamification_settings table for all gamification features
CREATE TABLE IF NOT EXISTS public.gamification_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feature TEXT NOT NULL UNIQUE,
  enabled BOOLEAN NOT NULL DEFAULT true,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gamification_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can view gamification settings
CREATE POLICY "Anyone can view gamification settings" 
ON public.gamification_settings 
FOR SELECT 
USING (true);

-- Only admins can manage gamification settings
CREATE POLICY "Admins can manage gamification settings" 
ON public.gamification_settings 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create flash_sales table for managing flash sales
CREATE TABLE IF NOT EXISTS public.flash_sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  discount_percent INTEGER NOT NULL DEFAULT 20,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  product_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for flash_sales
ALTER TABLE public.flash_sales ENABLE ROW LEVEL SECURITY;

-- Anyone can view active flash sales
CREATE POLICY "Anyone can view flash sales" 
ON public.flash_sales 
FOR SELECT 
USING (true);

-- Only admins can manage flash sales
CREATE POLICY "Admins can manage flash sales" 
ON public.flash_sales 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default gamification settings
INSERT INTO public.gamification_settings (feature, enabled, settings) VALUES
('welcome_popup', true, '{"delay": 3000, "discount_percent": 10, "discount_code": "WELCOME10", "title": "Welcome Gift!", "subtitle": "Subscribe now and get 10% OFF your first order!"}'),
('flash_sale_banner', true, '{"show_countdown": true}'),
('social_proof_toast', true, '{"interval": 30000, "show_purchases": true, "show_cart_adds": true, "show_reviews": true}'),
('product_badges', true, '{"show_new": true, "show_hot": true, "show_sale": true, "show_trending": true, "show_low_stock": true, "low_stock_threshold": 5, "new_days_threshold": 7}'),
('floating_cart', true, '{"show_on_mobile": true, "show_total": true}'),
('scroll_to_top', true, '{"show_after_scroll": 300}'),
('confetti_animations', true, '{"on_add_to_cart": true, "on_purchase": true}')
ON CONFLICT (feature) DO NOTHING;

-- Create triggers for updated_at
CREATE TRIGGER update_gamification_settings_updated_at
BEFORE UPDATE ON public.gamification_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_flash_sales_updated_at
BEFORE UPDATE ON public.flash_sales
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();