-- Customers table for managing customer accounts
-- Run this SQL to create the customers table in your database

CREATE TABLE IF NOT EXISTS customers
(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip VARCHAR(20),
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT customers_status_check CHECK (status IN ('active', 'inactive', 'pending'))
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers (email);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers (status);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers (created_at DESC);

-- Comment on table
COMMENT ON TABLE customers IS 'Customer accounts for the application';

-- Insert test customers
INSERT INTO customers (name, email, phone, address, city, state, zip, status, notes) VALUES
('John Doe', 'john.doe@example.com', '555-123-4567', '123 Main St', 'New York', 'NY', '10001', 'active', 'Test customer 1'),
('Jane Smith', 'jane.smith@example.com', '555-987-6543', '456 Oak Ave', 'Los Angeles', 'CA', '90001', 'active', 'Test customer 2'),
('Michael Johnson', 'michael.j@example.com', '555-222-3333', '789 Pine Rd', 'Chicago', 'IL', '60601', 'active', 'Frequent buyer'),
('Emily Brown', 'emily.b@example.com', '555-444-5555', '321 Elm St', 'Houston', 'TX', '77001', 'pending', 'New signup'),
('David Wilson', 'david.w@example.com', '555-666-7777', '654 Maple Dr', 'Phoenix', 'AZ', '85001', 'active', 'VIP customer'),
('Sarah Davis', 'sarah.d@example.com', '555-888-9999', '987 Cedar Ln', 'Miami', 'FL', '33101', 'inactive', 'Account on hold')
ON CONFLICT (email) DO NOTHING;
