# Business-MGT ERP Database

## Database Structure

backend/database/

├── schema.sql
├── seed.sql
└── README.md

---

## Files

### schema.sql

Creates the complete ERP database structure, including:

- users
- settings
- warehouses
- products
- product_items
- warehouse_inventory
- inventory_locations
- stock_movements
- activity_logs
- customers
- dispatch_transactions
- dispatch_items
- dispatch_serials

The schema is designed for a clean installation and does not contain application test data.

---

### seed.sql

Creates only the required initial system configuration:

- default settings record
- default Main Warehouse

The seed does not create an administrator account.

The first administrator is created through the ERP First Administrator + Currency Setup screen.

---

## Fresh Installation

For a new installation, create a clean database first:

    mysql -u root -p -e "CREATE DATABASE inventory_app CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;"

Import the schema:

    mysql -u root -p inventory_app < backend/database/schema.sql

Import the seed data:

    mysql -u root -p inventory_app < backend/database/seed.sql

The installation should then contain:

- 0 users
- 0 products
- 1 default warehouse
- 1 settings record
- settings.id = 1
- settings.setup_completed = 0

---

## First System Setup

After the application is started, the system checks whether initial setup has been completed.

On a fresh installation, the ERP displays the:

**First Administrator + Currency Setup**

screen.

The administrator provides:

- Username
- Telephone number
- Password
- Base Currency
- Display Currency
- Currency Symbol
- USD Exchange Rate
- Company Multiplier

The setup operation creates the first administrator and saves the currency configuration in a single transaction.

After successful setup:

    settings.setup_completed = 1

The system then proceeds to the normal login screen.

The setup endpoint cannot be used again after the system has been initialized.

---

## Default Currency Configuration

Fresh installations use these defaults:

| Setting | Default |
|---|---|
| Base Currency | USD |
| Display Currency | USD |
| Currency Symbol | $ |
| USD Exchange Rate | 1.00 |
| Company Multiplier | 1.25 |

The administrator can change these values during the first system setup.

---

## Important Installation Rule

seed.sql should be executed once after importing schema.sql.

For a completely fresh installation, recreate the database before importing the schema and seed files.

Do not repeatedly run seed.sql against an already initialized database.

---

## Inventory Rules

Products are definitions only.

Creating a product never creates stock.

Inventory enters the system only through:

- Stock In

Serialized products are stored in:

- product_items

Warehouse allocations are stored in:

- warehouse_inventory

Inventory history is stored in:

- stock_movements

---

## Protected Operations

### Users

- Cannot delete themselves.
- Cannot delete the last administrator.
- Cannot delete users with history.

### Products

- Cannot delete products with movement history.
- Cannot delete products with serialized items.
- Cannot delete products allocated to warehouses.

### Warehouses

- Cannot delete warehouses with inventory.
- Cannot delete the last warehouse.

---

## Version

1.0.0
