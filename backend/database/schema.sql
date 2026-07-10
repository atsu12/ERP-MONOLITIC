/*
===============================================================================

Business-MGT ERP
Official Database Schema

Version    : 1.0.0
Database   : inventory_app
Engine     : MySQL 8+
Charset    : utf8mb4
Collation  : utf8mb4_0900_ai_ci

===============================================================================

DATABASE PHILOSOPHY

Products
    → Product definitions only.

Product Items
    → Serialized inventory.

Warehouse Inventory
    → Warehouse allocation.

Stock Movements
    → Inventory history.

Activity Logs
    → User audit trail.

Reports
    → Read-only.

===============================================================================
*/

DROP DATABASE IF EXISTS inventory_app;

CREATE DATABASE IF NOT EXISTS inventory_app
CHARACTER SET utf8mb4
COLLATE utf8mb4_0900_ai_ci;

USE inventory_app;

/* =============================================================================
   TABLE: users

   PURPOSE
   -------
   Stores ERP users and role-based access control information.

   MODULE OWNER
   ------------
   Authentication

   USED BY
   -------
   Login
   Users
   Stock In
   Stock Out
   Audit Log

============================================================================= */

CREATE TABLE users (

    id INT NOT NULL AUTO_INCREMENT,

    username VARCHAR(100) NOT NULL,

    email VARCHAR(255) NOT NULL,

    password_hash VARCHAR(255) NOT NULL,

    role ENUM(
        'ADMIN',
        'MANAGER',
        'STAFF'
    ) NOT NULL DEFAULT 'STAFF',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uk_users_username (username),

    UNIQUE KEY uk_users_email (email)

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_0900_ai_ci;


/* =============================================================================
   TABLE: settings

   PURPOSE
   -------
   Stores global ERP configuration.

   MODULE OWNER
   ------------
   System Settings

   USED BY
   -------
   Dashboard
   Reports
   Inventory Valuation

============================================================================= */

CREATE TABLE settings (

    id INT NOT NULL AUTO_INCREMENT,

    display_currency VARCHAR(10) NOT NULL DEFAULT 'GHS',

    currency_symbol VARCHAR(10) NOT NULL DEFAULT 'GH₵',

    usd_exchange_rate DECIMAL(10,2) NOT NULL DEFAULT 15.50,

    company_multiplier DECIMAL(10,2) NOT NULL DEFAULT 1.25,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id)

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_0900_ai_ci;


/* =============================================================================
   TABLE: warehouses

   PURPOSE
   -------
   Stores warehouse definitions.

   MODULE OWNER
   ------------
   Warehouse Management

   USED BY
   -------
   Warehouses
   Warehouse Inventory
   Stock In
   Stock Out
   Reports

============================================================================= */

CREATE TABLE warehouses (

    id INT NOT NULL AUTO_INCREMENT,

    name VARCHAR(255) NOT NULL,

    code VARCHAR(50) NOT NULL,

    location VARCHAR(255) DEFAULT NULL,

    status ENUM(
        'ACTIVE',
        'INACTIVE'
    ) NOT NULL DEFAULT 'ACTIVE',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uk_warehouses_code (code),

    UNIQUE KEY uk_warehouses_name (name),

    INDEX idx_warehouses_status (status)

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_0900_ai_ci;


/* =============================================================================
   TABLE: products

   PURPOSE
   -------
   Stores product definitions only.

   DOES NOT STORE
   --------------
   Warehouse quantities.
   Serialized inventory.

   MODULE OWNER
   ------------
   Products

   USED BY
   -------
   Products
   Product Details
   Stock In
   Stock Out
   Warehouse Inventory
   Reports

============================================================================= */

CREATE TABLE products (

    id INT NOT NULL AUTO_INCREMENT,

    name VARCHAR(255) NOT NULL,

    brand VARCHAR(100) DEFAULT NULL,

    category VARCHAR(100) DEFAULT NULL,

    price DECIMAL(10,2) DEFAULT NULL,

    track_serial BOOLEAN NOT NULL DEFAULT FALSE,

    quantity INT NOT NULL DEFAULT 0,

    stock_unit VARCHAR(50) NOT NULL DEFAULT 'Unit',

    package_size INT NOT NULL DEFAULT 1,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    INDEX idx_products_name (name),

    INDEX idx_products_category (category),

    INDEX idx_products_brand (brand),

    INDEX idx_products_track_serial (track_serial),

    CONSTRAINT chk_products_price
        CHECK (price IS NULL OR price >= 0),

    CONSTRAINT chk_products_quantity
        CHECK (quantity >= 0),

    CONSTRAINT chk_products_package_size
        CHECK (package_size > 0)

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_0900_ai_ci;


/* =============================================================================
   TABLE: product_items

   PURPOSE
   -------
   Stores individual serialized inventory items.

   MODULE OWNER
   ------------
   Serialized Inventory

   USED BY
   -------
   Products
   Product Details
   Stock In
   Stock Out
   Warehouse Inventory
   Reports

============================================================================= */

CREATE TABLE product_items (

    id INT NOT NULL AUTO_INCREMENT,

    product_id INT NOT NULL,

    serial_number VARCHAR(255) NOT NULL,

    status ENUM(
        'IN_STOCK',
        'OUT',
        'DAMAGED'
    ) NOT NULL DEFAULT 'IN_STOCK',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uk_product_items_serial_number (serial_number),

    INDEX idx_product_items_product (product_id),

    INDEX idx_product_items_status (status),

    CONSTRAINT fk_product_items_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_0900_ai_ci;


/* =============================================================================
   TABLE: warehouse_inventory

   PURPOSE
   -------
   Stores the quantity of each product allocated to each warehouse.

   This is the ONLY table that owns warehouse inventory.

   MODULE OWNER
   ------------
   Warehouse Inventory

   USED BY
   -------
   Warehouse Inventory
   Stock In
   Stock Out
   Reports
   Dashboard

============================================================================= */

CREATE TABLE warehouse_inventory (

    id INT NOT NULL AUTO_INCREMENT,

    warehouse_id INT NOT NULL,

    product_id INT NOT NULL,

    quantity INT NOT NULL DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    UNIQUE KEY uk_warehouse_inventory
        (warehouse_id, product_id),

    INDEX idx_warehouse_inventory_product (product_id),

    CONSTRAINT fk_warehouse_inventory_warehouse
        FOREIGN KEY (warehouse_id)
        REFERENCES warehouses(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_warehouse_inventory_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT chk_warehouse_inventory_quantity
        CHECK (quantity >= 0)

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_0900_ai_ci;



/* =============================================================================
   TABLE: stock_movements

   PURPOSE
   -------
   Records every inventory movement performed in the ERP.

   This table is an immutable business history.

   Inventory quantities are updated elsewhere.
   This table NEVER owns inventory.

   MODULE OWNER
   ------------
   Inventory Movements

   USED BY
   -------
   Stock In
   Stock Out
   Product Details
   Reports
   Dashboard

============================================================================= */

CREATE TABLE stock_movements (

    id INT NOT NULL AUTO_INCREMENT,

    product_id INT NOT NULL,

    user_id INT DEFAULT NULL,

    serial_number VARCHAR(255) DEFAULT NULL,

    type ENUM(
        'RECEIVED',
        'STOCK_OUT',
        'RETURNED',
        'TRANSFERRED',
        'ADJUSTMENT_IN',
        'ADJUSTMENT_OUT',
        'DAMAGED'
    ) NOT NULL,

    quantity INT NOT NULL DEFAULT 1,

    reference VARCHAR(255) DEFAULT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    INDEX idx_stock_movements_product (product_id),

    INDEX idx_stock_movements_user (user_id),

    INDEX idx_stock_movements_type (type),

    INDEX idx_stock_movements_created (created_at),

    CONSTRAINT chk_stock_movements_quantity
        CHECK (quantity > 0)

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_0900_ai_ci;



/* =============================================================================
   TABLE: activity_logs

   PURPOSE
   -------
   Records user activity throughout the ERP.

   This table is an immutable audit trail.

   MODULE OWNER
   ------------
   Audit Log

   USED BY
   -------
   Authentication
   Users
   Products
   Warehouses
   Reports
   Audit Log

============================================================================= */

CREATE TABLE activity_logs (

    id INT NOT NULL AUTO_INCREMENT,

    user_id INT DEFAULT NULL,

    username VARCHAR(100) DEFAULT NULL,

    action TEXT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    INDEX idx_activity_logs_user (user_id),

    INDEX idx_activity_logs_created (created_at)

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_0900_ai_ci;