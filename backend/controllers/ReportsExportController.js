const reports = require("../services/reports");
const exportsService = require("../services/reports/exports");

exports.exportReportCSV = async (req, res) => {
  try {
    const { report } = req.params;

    let rows = [];
    let columns = [];

    switch (report) {
      case "inventory":
        rows = await reports.getInventoryValuation(req.query);

        columns = [
          "name",
          "brand",
          "category",
          "quantity",
          "price",
          "inventoryValue",
        ];
        break;

      default:
        return res.status(400).json({
          error: "Unknown report",
        });
    }

    const csv = exportsService.exportCSV({
      columns,
      rows,
    });

    res.setHeader(
      "Content-Type",
      "text/csv; charset=utf-8",
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${report}.csv"`,
    );

    res.send(csv);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
