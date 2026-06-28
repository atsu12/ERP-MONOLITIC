-- -- Create Database and User

-- CREATE USER 'inventory_user'@'192.168.1.101'
-- IDENTIFIED BY 'frank12secure';

-- GRANT ALL PRIVILEGES ON inventory_app.* 
-- TO 'inventory_user'@'192.168.1.101';
-- FLUSH PRIVILEGES;

-- =========================
-- RESET DATABASE
-- =========================
DROP DATABASE IF EXISTS inventory_app;
CREATE DATABASE inventory_app;
USE inventory_app;

-- =========================
-- PRODUCTS TABLE
-- =========================
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(100),
  price DECIMAL(10,2) CHECK (price >= 0),
  track_serial BOOLEAN NOT NULL DEFAULT FALSE,
  quantity INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_name ON products(name);

-- =========================
-- PRODUCT ITEMS (SERIALIZED UNITS)
-- =========================
CREATE TABLE product_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  serial_number VARCHAR(255) NOT NULL UNIQUE,
  status ENUM('IN_STOCK','OUT','DAMAGED') DEFAULT 'IN_STOCK',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX idx_product_items_product_id ON product_items(product_id);
CREATE INDEX idx_product_items_status ON product_items(status);

-- =========================
-- STOCK MOVEMENTS (AUDIT)
-- =========================

CREATE TABLE stock_movements (

    id INT AUTO_INCREMENT PRIMARY KEY,

    product_id INT NOT NULL,

    serial_number VARCHAR(255) NULL,

    user_id INT NULL,

    type ENUM(
        'RECEIVED',
        'SCANNED_OUT',
        'RETURNED',
        'DAMAGED',
        'TRANSFERRED',
        'ADJUSTMENT_IN',
        'ADJUSTMENT_OUT'
    ) NOT NULL,

    quantity INT NOT NULL DEFAULT 1,

    reference VARCHAR(255) NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP

);
CREATE INDEX idx_stock_product_id ON stock_movements(product_id);

-- =========================
-- TRIGGERS (STRICT CONTROL)
-- =========================
DELIMITER //

-- Serialized product must have quantity = 0
CREATE TRIGGER trg_products_before_insert
BEFORE INSERT ON products
FOR EACH ROW
BEGIN
  IF NEW.track_serial = TRUE AND NEW.quantity != 0 THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Serialized products must have quantity = 0';
  END IF;
END;
//

CREATE TRIGGER trg_products_before_update
BEFORE UPDATE ON products
FOR EACH ROW
BEGIN
  IF NEW.track_serial = TRUE AND NEW.quantity != 0 THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Serialized products must have quantity = 0';
  END IF;
END;
//

-- Prevent serial items for bulk products
CREATE TRIGGER trg_product_items_before_insert
BEFORE INSERT ON product_items
FOR EACH ROW
BEGIN
  DECLARE is_serial BOOLEAN;

  SELECT track_serial INTO is_serial
  FROM products WHERE id = NEW.product_id;

  IF is_serial = FALSE THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Cannot add serial items to bulk product';
  END IF;
END;
//

DELIMITER ;

-- =========================
-- DUMMY DATA
-- =========================

-- BULK PRODUCTS
INSERT INTO products (name, brand, price, track_serial, quantity) VALUES
('Rice Bag 50kg', 'GoldenFarm', 45.00, FALSE, 120),
('Sugar 1kg', 'SweetCo', 2.50, FALSE, 300);

-- SERIALIZED PRODUCTS
INSERT INTO products (name, brand, price, track_serial) VALUES
('Dell XPS 13 Laptop', 'Dell', 1200.00, TRUE),
('iPhone 14', 'Apple', 999.00, TRUE);

-- SERIAL NUMBERS (ACTUAL SCANNABLE VALUES)
INSERT INTO product_items (product_id, serial_number) VALUES
(3, 'DELL-001'),
(3, 'DELL-002'),
(3, 'DELL-003'),
(4, 'IPH-001'),
(4, 'IPH-002'),
(4, 'IPH-003');

-- STOCK MOVEMENTS
INSERT INTO stock_movements (
    product_id,
    type,
    quantity
) VALUES
(1, 'RECEIVED', 120),
(2, 'RECEIVED', 300),
(3, 'RECEIVED', 3),
(4, 'RECEIVED', 3);

-- SIMULATE SALES
UPDATE product_items
SET status = 'OUT'
WHERE serial_number IN ('DELL-001', 'IPH-002');

-- =========================
-- FINAL VIEW (HYBRID LOGIC)
-- =========================
SELECT 
  p.id,
  p.name,
  p.brand,
  CASE 
    WHEN p.track_serial = TRUE 
      THEN COUNT(pi.id)
    ELSE p.quantity
  END AS actual_quantity
FROM products p
LEFT JOIN product_items pi 
  ON p.id = pi.product_id 
  AND pi.status = 'IN_STOCK'
GROUP BY p.id;

USE inventory_app;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,

    username VARCHAR(100) UNIQUE NOT NULL,

    email VARCHAR(255) UNIQUE NOT NULL,

    password_hash VARCHAR(255) NOT NULL,

    role ENUM('ADMIN', 'MANAGER', 'STAFF')
    DEFAULT 'STAFF',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add unique constraint to serial_number in product_items to prevent duplicates and ensure data integrity for serialized products.

ALTER TABLE product_items
ADD CONSTRAINT unique_serial
UNIQUE (serial_number);

ALTER TABLE products
ADD COLUMN category VARCHAR(100) NULL;

-- Add location column to product_items to track where each serialized item is stored (e.g., WAREHOUSE, SHOWROOM).

ALTER TABLE product_items
ADD COLUMN location
ENUM(
  'WAREHOUSE',
  'SHOWROOM'
)
NOT NULL
DEFAULT 'WAREHOUSE';

-- Create a new table to track inventory levels at different locations for both bulk and serialized products.

CREATE TABLE inventory_locations (

  id INT AUTO_INCREMENT PRIMARY KEY,

  product_id INT NOT NULL,

  location ENUM(
    'WAREHOUSE',
    'SHOWROOM'
  ) NOT NULL,

  quantity INT NOT NULL DEFAULT 0,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY unique_product_location (
    product_id,
    location
  ),

  FOREIGN KEY (product_id)
  REFERENCES products(id)
  ON DELETE CASCADE

);

-- Add settings table to store application-wide configurations like currency, exchange rates, and company-specific multipliers for pricing.
CREATE TABLE settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  display_currency VARCHAR(10) NOT NULL DEFAULT 'GHS',
  currency_symbol VARCHAR(10) NOT NULL DEFAULT 'GH₵',
  usd_exchange_rate DECIMAL(10,2) NOT NULL DEFAULT 15.50,
  company_multiplier DECIMAL(10,2) NOT NULL DEFAULT 1.25,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


-- Insert default settings record with realistic values for Ghanaian Cedi (GHS) as the display currency, 
-- along with the current exchange rate to USD and a company multiplier for pricing calculations. This ensures the application has a baseline configuration to work with right from the start.

INSERT INTO settings (
  display_currency,
  currency_symbol,
  usd_exchange_rate,
  company_multiplier
)
VALUES (
  'GHS',
  'GH₵',
  15.50,
  1.25
);

-- Query to verify that the settings have been inserted correctly and to view the current configuration values for display currency, 
-- exchange rates, and company multiplier.    
SELECT * FROM settings;

--  =========================
-- WAREHOUSES TABLE
--  =========================   

USE inventory_app;

CREATE TABLE warehouses (
  id INT AUTO_INCREMENT PRIMARY KEY,

  name VARCHAR(255) NOT NULL,

  code VARCHAR(50) UNIQUE NOT NULL,

  location VARCHAR(255),

  status ENUM(
    'ACTIVE',
    'INACTIVE'
  ) DEFAULT 'ACTIVE',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ON UPDATE CURRENT_TIMESTAMP
);

-- Add some initial warehouse records to the warehouses table to represent different 
-- storage locations for inventory management. This will help in tracking where products are stored and facilitate better logistics and stock control.

INSERT INTO warehouses (
  name,
  code,
  location
)
VALUES
(
  'Main Warehouse',
  'MWH',
  'Accra HQ'
),
(
  'Tema Branch',
  'TBR',
  'Tema'
),
(
  'Cold Storage',
  'CST',
  'Kumasi'
);

-- Add stock_unit and package_size columns to the products table to allow for more detailed 
-- inventory management, including specifying the unit of measurement for stock and the size of product packages.

ALTER TABLE products
ADD stock_unit VARCHAR(50) DEFAULT 'Unit',
ADD package_size INT NOT NULL DEFAULT 1;

-- Create a new table to manage inventory levels at different warehouses,
--  allowing for tracking of product quantities across multiple storage locations. This will enable better inventory control and distribution management.
CREATE TABLE warehouse_inventory (
  id INT AUTO_INCREMENT PRIMARY KEY,

  warehouse_id INT NOT NULL,

  product_id INT NOT NULL,

  quantity INT NOT NULL DEFAULT 0,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY unique_inventory (
    warehouse_id,
    product_id
  )
);


-- Add foreign key constraints to the warehouse_inventory table to ensure referential 
-- integrity between warehouses and products. This will prevent orphaned records and maintain consistent relationships between inventory data.
CREATE TABLE warehouse_inventory (
  id INT AUTO_INCREMENT PRIMARY KEY,

  warehouse_id INT NOT NULL,

  product_id INT NOT NULL,

  quantity INT NOT NULL DEFAULT 0,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY unique_inventory (
    warehouse_id,
    product_id
  )
);


