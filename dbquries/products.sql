-- Create products table for product management
-- Run this once to set up the products system
-- Designed for salon/beauty service products
-- 
-- Field Descriptions:
-- product_id: Unique identifier
-- product_name: Product name (e.g., "Basic Haircut", "Full Hair Color")
-- category: Product type (Cutting, Coloring, Styling, Treatments, Extensions)
-- description: Details about what's included
-- price: Price options array (e.g., [{"name": "Short Hair", "amount": 45}, {"name": "Long Hair", "amount": 65}])
-- duration_minutes: How long the service takes
-- staff_required: Number of stylists needed
-- difficulty_level: Expertise required (Beginner, Intermediate, Advanced)
-- required_materials: Materials/products needed (JSON format)
-- availability_status: Whether product is available (Available, Unavailable, Special Request)
-- is_active: Hide discontinued products
-- date_created: Track when product was added
-- date_updated: Track last update

CREATE TABLE IF NOT EXISTS products (
  product_id SERIAL PRIMARY KEY,
  product_name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  price JSONB NOT NULL,
  duration_minutes INT NOT NULL,
  staff_required INT DEFAULT 1,
  difficulty_level VARCHAR(20) DEFAULT 'Intermediate',
  required_materials JSONB,
  availability_status VARCHAR(20) DEFAULT 'Available',
  is_active BOOLEAN DEFAULT TRUE,
  date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CHECK (difficulty_level IN ('Beginner', 'Intermediate', 'Advanced')),
  CHECK (availability_status IN ('Available', 'Unavailable', 'Special Request'))
);

CREATE INDEX idx_products_name ON products(product_name);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(availability_status);

-- Create function to auto-update date_updated
CREATE OR REPLACE FUNCTION update_products_updated_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.date_updated = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating date_updated
DROP TRIGGER IF EXISTS products_updated_timestamp ON products;
CREATE TRIGGER products_updated_timestamp
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_products_updated_timestamp();

-- Insert sample salon/beauty services
INSERT INTO products (
  product_name, 
  category, 
  description, 
  price, 
  duration_minutes, 
  staff_required, 
  difficulty_level, 
  required_materials, 
  availability_status,
  is_active
) 
VALUES 
  (
    'Basic Haircut', 
    'Cutting', 
    'Professional haircut with wash, cut, and style. Includes consultation and finishing products.', 
    '[{"name": "Short Hair", "amount": 35}, {"name": "Medium Hair", "amount": 45}, {"name": "Long Hair", "amount": 55}]'::jsonb,
    45, 
    1, 
    'Beginner', 
    '["Shampoo", "Conditioner", "Scissors", "Styling Product"]'::jsonb,
    'Available',
    TRUE
  ),
  (
    'Full Hair Color', 
    'Coloring', 
    'Complete hair coloring service including roots to ends. Includes toner, treatment, and style.', 
    '[{"name": "Single Process", "amount": 100}, {"name": "Double Process", "amount": 150}]'::jsonb,
    180, 
    1, 
    'Intermediate', 
    '["Color Formula", "Developer", "Toner", "Treatment", "Gloves", "Bowls"]'::jsonb,
    'Available',
    TRUE
  ),
  (
    'Balayage', 
    'Coloring', 
    'Hand-painted highlights for natural-looking dimension. Includes toner, treatment, and blowout.', 
    '[{"name": "Partial Balayage", "amount": 150}, {"name": "Full Balayage", "amount": 200}, {"name": "Full + Toner", "amount": 250}]'::jsonb,
    240, 
    2, 
    'Advanced', 
    '["Lightener", "Developer", "Toner", "Treatment", "Foils", "Brushes"]'::jsonb,
    'Available',
    TRUE
  );

-- View all products
SELECT product_id, product_name, category, price, duration_minutes, difficulty_level, availability_status, is_active 
FROM products 
ORDER BY product_id;
