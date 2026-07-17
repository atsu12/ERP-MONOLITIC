# Business-MGT ERP Database

## Database Structure

backend/database/

├── schema.sql

├── seed.sql

└── README.md

---

## Files

### schema.sql

Creates:

- users
- settings
- warehouses
- products
- product_items
- warehouse_inventory
- stock_movements
- activity_logs

---

### seed.sql

Creates:

- default settings
- default administrator account
- default warehouse

---

## Installation

From the project root:

```cmd
mysql -u root -p < backend/database/schema.sql
```

Then:

```cmd
mysql -u root -p inventory_app < backend/database/seed.sql
```

---

## Default Login

Username:

```text
admin
```

Password:

```text
admin123
```

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

Users:

- Cannot delete themselves.
- Cannot delete the last administrator.
- Cannot delete users with history.

Products:

- Cannot delete products with movement history.
- Cannot delete products with serialized items.
- Cannot delete products allocated to warehouses.

Warehouses:

- Cannot delete warehouses with inventory.
- Cannot delete the last warehouse.

Version:

1.0.0

---
