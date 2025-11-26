-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Anyone can view active categories
CREATE POLICY "Anyone can view active categories"
ON public.categories FOR SELECT
USING (is_active = true OR auth.uid() IS NOT NULL);

-- Admins can manage categories
CREATE POLICY "Admins can manage categories"
ON public.categories FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Add custom_css to settings table if it doesn't exist
INSERT INTO public.settings (key, value, description)
VALUES ('custom_css', '', 'Custom CSS to override site styles')
ON CONFLICT (key) DO NOTHING;