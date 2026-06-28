const express = require("express");

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({
    status: "ok",
  });
});

/* =========================
MIDDLEWARE
========================= */

const authMiddleware = require("../middleware/authMiddleware");

const roleMiddleware = require("../middleware/roleMiddleware");

/* =========================
CONTROLLERS
========================= */

const {
  getUsers,

  createUser,

  updateUser,

  deleteUser,

  changePassword,
} = require("../controllers/UsersController");
// AUTH

const { login } = require("../controllers/AuthController");

// WAREHOUSES

const {
  getWarehouseInventory,
  assignInventory,
  updateAllocation,
  deleteAllocation,
} = require("../controllers/WarehouseInventoryController");

// PRODUCTS

const {
  getProducts,

  getProductById,

  createProduct,

  updateProduct,

  deleteProduct,
} = require("../controllers/ProductsController");

// STOCK

const {
  addStock,

  removeStock,
} = require("../controllers/StockController");

// SCAN

const { scanItem } = require("../controllers/ScanController");

// ACTIVITY

const { getActivityLogs } = require("../controllers/ActivityController");

// SERIALS

const { registerSerial } = require("../controllers/SerialController");

// PRODUCT ITEMS

const { getProductItems } = require("../controllers/ProductItemsController");

// REPORTS

const {
  getMovements,
  getProductMovements,
  getDashboardReport,
  getInventoryValuation,
} = require("../controllers/ReportsController");

const {
  getSettings,
  updateSettings,
} = require("../controllers/SettingsController");

const {
  getWarehouses,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
} = require("../controllers/WarehousesController");

/* =========================
AUTH
========================= */

router.post("/login", login);

/* =========================
PRODUCTS
========================= */

// GET ALL PRODUCTS

router.get("/products", getProducts);

// GET SINGLE PRODUCT

router.get("/products/:id", authMiddleware, getProductById);

router.get(
  "/products/:id/movements",
  authMiddleware,
  roleMiddleware(["ADMIN", "MANAGER"]),
  getProductMovements,
);

// CREATE PRODUCT

router.post(
  "/products",
  authMiddleware,
  roleMiddleware(["ADMIN", "MANAGER"]),
  createProduct,
);

// UPDATE PRODUCT

router.put(
  "/products/:id",
  authMiddleware,
  roleMiddleware(["ADMIN", "MANAGER"]),
  updateProduct,
);

// DELETE PRODUCT

router.delete(
  "/products/:id",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  deleteProduct,
);

/* =========================
PRODUCT ITEMS
========================= */

router.get("/products/:productId/items", authMiddleware, getProductItems);

/* =========================
SERIALS
========================= */

router.post("/serials", authMiddleware, registerSerial);

/* =========================
SCAN
========================= */

router.post("/scan", authMiddleware, scanItem);

/* =========================
STOCK
========================= */

router.post(
  "/stock/in",
  authMiddleware,
  roleMiddleware(["ADMIN", "MANAGER", "STAFF"]),
  addStock,
);

router.post(
  "/stock/out",
  authMiddleware,
  roleMiddleware(["ADMIN", "MANAGER", "STAFF"]),
  removeStock,
);

/* =========================
ACTIVITY
========================= */

router.get(
  "/activity",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  getActivityLogs,
);

/* =========================
REPORTS DASHBOARD
========================= */

router.get(
  "/reports/dashboard",
  authMiddleware,
  roleMiddleware([
    "ADMIN",
    "MANAGER"
  ]),
  getDashboardReport
);

router.get(
  "/reports/inventory",
  authMiddleware,
  roleMiddleware(["ADMIN", "MANAGER"]),
  getInventoryValuation,
);

/* =========================
MOVEMENTS
========================= */

router.get(
  "/movements",
  authMiddleware,
  roleMiddleware(["ADMIN", "MANAGER"]),
  getMovements,
);

/* =========================
USERS
========================= */

router.get(
  "/users",
  authMiddleware,
  roleMiddleware(["ADMIN", "MANAGER"]),
  getUsers,
);

router.post(
  "/users",
  authMiddleware,
  roleMiddleware(["ADMIN", "MANAGER"]),
  createUser,
);

router.put(
  "/users/change-password",
  authMiddleware,
  changePassword,
);

router.put(
  "/users/:id",
  authMiddleware,
  roleMiddleware(["ADMIN", "MANAGER"]),
  updateUser,
);

router.delete(
  "/users/:id",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  deleteUser,
);

/* =========================
WAREHOUSES
========================= */

router.get(
  "/warehouses",
  authMiddleware,
  getWarehouses,
);

router.get(
  "/warehouses/:warehouseId/inventory",
  authMiddleware,
  getWarehouseInventory,
);

router.post(
  "/warehouses/inventory",
  authMiddleware,
  roleMiddleware(["ADMIN", "MANAGER"]),
  assignInventory,
);

router.put(
  "/warehouses/inventory/:id",
  authMiddleware,
  roleMiddleware(["ADMIN", "MANAGER"]),
  updateAllocation,
);

router.delete(
  "/warehouses/inventory/:id",
  authMiddleware,
  roleMiddleware(["ADMIN", "MANAGER"]),
  deleteAllocation,
);

router.post(
  "/warehouses",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  createWarehouse,
);

router.put(
  "/warehouses/:id",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  updateWarehouse,
);

router.delete(
  "/warehouses/:id",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  deleteWarehouse,
);

/* =========================
SETTINGS
========================= */

router.get("/settings", authMiddleware, roleMiddleware(["ADMIN"]), getSettings);

router.put(
  "/settings",
  authMiddleware,
  roleMiddleware(["ADMIN"]),
  updateSettings,
);

module.exports = router;
