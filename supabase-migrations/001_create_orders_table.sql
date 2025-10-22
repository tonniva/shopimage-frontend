-- Create orders table for payment system
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    
    -- Customer Information
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    
    -- Product Details
    product_type VARCHAR(50) NOT NULL, -- 'mica-magnetic-photos', 'pet-tag', etc.
    quantity INT NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    
    -- Stripe Payment
    stripe_payment_intent VARCHAR(255),
    stripe_payment_id VARCHAR(255) UNIQUE,
    payment_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'refunded'
    paid_at TIMESTAMPTZ,
    
    -- Design Files (stored in Supabase Storage)
    design_data JSONB, -- All design settings (positions, zoom, background, etc.)
    file_urls TEXT[], -- Array of processed image URLs
    scene_url TEXT, -- Composite image URL (images on fridge)
    scene_storage_path TEXT, -- Supabase Storage path
    
    -- Production & Fulfillment
    production_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'in-production', 'completed', 'shipped'
    notes TEXT,
    
    -- Shipping
    shipping_address JSONB,
    tracking_number VARCHAR(100),
    shipped_at TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_production_status ON orders(production_status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_stripe_payment_intent ON orders(stripe_payment_intent);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- 1. Customers can view their own orders (if logged in)
CREATE POLICY "Customers can view own orders"
ON orders FOR SELECT
USING (
    auth.uid() = user_id 
    OR customer_email = auth.email()
);

-- 2. Anyone can insert orders (during checkout, before auth)
CREATE POLICY "Anyone can create orders"
ON orders FOR INSERT
WITH CHECK (true);

-- 3. Service role can do everything (for API routes)
CREATE POLICY "Service role full access"
ON orders FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_orders_updated_at 
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('mica-scenes', 'mica-scenes', true),
    ('mica-files', 'mica-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public can view scene images"
ON storage.objects FOR SELECT
USING (bucket_id = 'mica-scenes');

CREATE POLICY "Authenticated can upload scenes"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'mica-scenes');

CREATE POLICY "Service role can access mica-files"
ON storage.objects FOR ALL
USING (bucket_id = 'mica-files' AND auth.jwt() ->> 'role' = 'service_role');

