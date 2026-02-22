-- Orders table for managing customer orders
-- Run this SQL to create the orders table in your database

-- Create sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Create orders table
CREATE TABLE IF NOT EXISTS orders
(
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL DEFAULT (
        'ORD-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(nextval('order_number_seq')::text, 6, '0')
    ),
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    recipient_name VARCHAR(255),
    recipient_email VARCHAR(255),
    recipient_phone VARCHAR(20),
    delivery_option VARCHAR(50) NOT NULL DEFAULT 'pickup',
    delivery_address TEXT,
    delivery_date TIMESTAMP,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'cash',
    subtotal NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    tax NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    shipping NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    total NUMERIC(10,2) NOT NULL,
    special_instructions TEXT,
    message TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT orders_order_number_key UNIQUE (order_number),
    CONSTRAINT orders_delivery_option_check CHECK (delivery_option IN ('pickup', 'delivery', 'shipping')),
    CONSTRAINT orders_payment_method_check CHECK (payment_method IN ('zelle', 'cash', 'card', 'paypal')),
    CONSTRAINT orders_status_check CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled'))
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders (customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders (order_number);

-- Comment on table
COMMENT ON TABLE orders IS 'Customer orders for the application';

-- Sample orders data
INSERT INTO orders (customer_name, customer_email, customer_phone, delivery_option, payment_method, subtotal, tax, total, status, special_instructions)
VALUES 
  ('John Smith', 'john.smith@email.com', '555-0101', 'pickup', 'cash', 45.00, 3.60, 48.60, 'pending', 'Please call when ready'),
  ('Sarah Johnson', 'sarah.j@email.com', '555-0102', 'delivery', 'zelle', 125.00, 10.00, 135.00, 'processing', 'Leave at front door'),
  ('Michael Brown', 'mbrown@email.com', '555-0103', 'shipping', 'card', 89.99, 7.20, 97.19, 'shipped', NULL),
  ('Emily Davis', 'emily.davis@email.com', '555-0104', 'pickup', 'paypal', 199.50, 15.96, 215.46, 'delivered', 'Gift wrapping requested'),
  ('Robert Wilson', 'rwilson@email.com', '555-0105', 'delivery', 'cash', 55.00, 4.40, 59.40, 'cancelled', 'Customer changed mind')
ON CONFLICT DO NOTHING;
