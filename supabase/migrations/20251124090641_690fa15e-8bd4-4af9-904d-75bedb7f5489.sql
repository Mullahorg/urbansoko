-- Drop and recreate analytics view WITHOUT security definer
DROP VIEW IF EXISTS order_analytics;

CREATE OR REPLACE VIEW order_analytics 
WITH (security_invoker = true)
AS
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