-- Create settings table for M-Pesa and other app configurations
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Only admins can manage settings
CREATE POLICY "Admins can manage all settings"
ON public.settings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Insert default M-Pesa settings placeholders
INSERT INTO public.settings (key, value, description) VALUES
  ('mpesa_consumer_key', '', 'M-Pesa API Consumer Key'),
  ('mpesa_consumer_secret', '', 'M-Pesa API Consumer Secret'),
  ('mpesa_shortcode', '', 'M-Pesa Business Shortcode'),
  ('mpesa_passkey', '', 'M-Pesa Passkey'),
  ('mpesa_callback_url', '', 'M-Pesa Callback URL (optional)'),
  ('mpesa_environment', 'sandbox', 'M-Pesa Environment (sandbox or production)')
ON CONFLICT (key) DO NOTHING;