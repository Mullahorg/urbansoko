-- Add storage bucket for transaction screenshots
INSERT INTO storage.buckets (id, name, public) 
VALUES ('transaction-screenshots', 'transaction-screenshots', false);

-- Storage policies for transaction screenshots
CREATE POLICY "Users can upload their transaction screenshots"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'transaction-screenshots' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own transaction screenshots"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'transaction-screenshots' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all transaction screenshots"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'transaction-screenshots' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Add transaction screenshot URL to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS transaction_screenshot_url text;

-- Insert default settings for M-Pesa payment
INSERT INTO settings (key, value, description)
VALUES 
  ('mpesa_paybill', '123456', 'M-Pesa Paybill Number'),
  ('mpesa_business_name', 'Your Business Name', 'M-Pesa Business Name'),
  ('mpesa_account_number', 'Account', 'M-Pesa Account Number')
ON CONFLICT (key) DO NOTHING;