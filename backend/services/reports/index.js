const summary = require("./summary");
const movements = require("./movements");
const inventory = require("./inventory");
const warehouse = require("./warehouse");

async function getDashboard(filters = {}) {
  const [
    summaryData,
    fastMovingProducts,
    slowMovingProducts,
    recentMovements,
  ] = await Promise.all([
    summary.getSummary(filters),
    movements.getFastMoving(filters),
    movements.getSlowMoving(filters),
    movements.getRecentMovements(filters),
  ]);

  return {
    ...summaryData,
    fastMovingProducts,
    slowMovingProducts,
    recentMovements,
  };
}

module.exports = {
  getDashboard,

  getInventoryValuation:
    inventory.getInventoryValuation,

  getWarehouseSummary:
    warehouse.getWarehouseSummary,
};