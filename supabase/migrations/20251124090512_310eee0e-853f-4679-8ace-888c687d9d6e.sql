-- Create site_content table for managing editable content
CREATE TABLE IF NOT EXISTS site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section text NOT NULL UNIQUE,
  content jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT now(),
  updated_by uuid REFERENCES profiles(id),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view site content"
ON site_content FOR SELECT
USING (true);

CREATE POLICY "Admins can manage site content"
ON site_content FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default content
INSERT INTO site_content (section, content) VALUES
('hero', '{
  "title": "Discover Authentic African Fashion",
  "subtitle": "Handcrafted garments celebrating African heritage and modern style",
  "ctaText": "Shop Now",
  "ctaLink": "/products"
}'::jsonb),
('features', '[
  {"icon": "Truck", "title": "Free Shipping", "description": "Free delivery within Nairobi"},
  {"icon": "Shield", "title": "Secure Payment", "description": "100% secure M-Pesa payments"},
  {"icon": "Award", "title": "Premium Quality", "description": "Handpicked authentic fabrics"}
]'::jsonb),
('footer', '{
  "description": "Your premier destination for authentic African fashion",
  "social": {"facebook": "#", "instagram": "#", "twitter": "#"}
}'::jsonb)
ON CONFLICT (section) DO NOTHING;

-- Create analytics view
CREATE OR REPLACE VIEW order_analytics AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as total_orders,
  SUM(total_amount) as total_revenue,
  AVG(total_amount) as avg_order_value,
  COUNT(CASE WHEN payment_status = 'completed' THEN 1 END) as completed_orders,
  COUNT(CASE WHEN payment_status = 'pending' THEN 1 END) as pending_orders
FROM orders
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- Grant access to analytics view
GRANT SELECT ON order_analytics TO authenticated;