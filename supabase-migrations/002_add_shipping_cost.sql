-- Add shipping_cost column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(10,2) DEFAULT 0;

-- Add comment for clarity
COMMENT ON COLUMN orders.shipping_cost IS 'Shipping cost in THB';
