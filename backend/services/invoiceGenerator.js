const ExcelJS = require("exceljs");

const path = require("path");

const db = require("../configs/db").promise();

/* ===========================================================
   TEMPLATE CONFIGURATION
=========================================================== */

const TEMPLATE = {
  itemStartRow: 23,
  itemEndRow: 44,
  totalsStartRow: 45,

  logo: {
    column: 0.3,
    row: 0.3,
    width: 140,
    height: 80,
  },
};

/* =========================
   LOAD SETTINGS
========================= */

async function getSettings() {
  const [rows] = await db.query("SELECT * FROM settings WHERE id = 1");

  if (rows.length === 0) {
    throw new Error("Settings record not found.");
  }

  return rows[0];
}

/* =========================
   LOAD TEMPLATE
========================= */

async function loadInvoiceTemplate() {
  const settings = await getSettings();

  if (!settings.invoice_template_path) {
    throw new Error("No invoice template has been uploaded.");
  }

  const workbook = new ExcelJS.Workbook();

  const templatePath = path.join(
    __dirname,
    "..",
    settings.invoice_template_path,
  );

  await workbook.xlsx.readFile(templatePath);

  return {
    workbook,
    settings,
  };
}

/* =========================
   GENERATE INVOICE NUMBER
========================= */

async function generateInvoiceNumber(settings) {
  const prefix = settings.invoice_prefix || "INV";

  const length = Number(settings.invoice_number_length || 6);

  const nextNumber = Number(settings.invoice_next_number || 1);

  const invoiceNumber = prefix + String(nextNumber).padStart(length, "0");

  await db.query(
    `
    UPDATE settings
    SET invoice_next_number = invoice_next_number + 1
    WHERE id = 1
    `,
  );

  return invoiceNumber;
}

/* =========================
   FORMAT INVOICE DATE
========================= */

function formatInvoiceDate(date = new Date()) {
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

/* =========================
   GET PREPARED BY
========================= */

async function getPreparedBy(staffId) {
  const [rows] = await db.query(
    `
    SELECT
      username,
      telephone
    FROM users
    WHERE id = ?
    `,
    [staffId],
  );

  return rows.length
    ? rows[0]
    : {
        username: "",
        telephone: "",
      };
}

/* =========================
   GET DISPATCH ITEMS
========================= */

async function getDispatchItems(dispatchId) {
  const [rows] = await db.query(
    `
    SELECT
      di.quantity,
      di.unit_price,
      p.name
    FROM dispatch_items di
    JOIN products p
      ON p.id = di.product_id
    WHERE di.dispatch_id = ?
    ORDER BY di.id ASC
    `,
    [dispatchId],
  );

  return rows;
}

/* =========================
   REPLACE PLACEHOLDERS
========================= */

function replacePlaceholders(worksheet, values) {
  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      if (typeof cell.value !== "string") {
        return;
      }

      let text = cell.value;

      Object.entries(values).forEach(([key, value]) => {
        text = text.replaceAll(`{{${key}}}`, value ?? "");
      });

      cell.value = text;
    });
  });
}

/* =========================
   SHIFT FORMULA ROW REFERENCES
========================= */

function shiftFormulaRows(formula, insertionRow, rowsToInsert) {
  if (typeof formula !== "string") {
    return formula;
  }

  return formula.replace(
    /(\$?[A-Z]{1,3})(\$?)(\d+)/g,
    (match, column, rowAbsolute, rowNumber) => {
      const row = Number(rowNumber);

      /*
       * Do not move absolute row references.
       */
      if (rowAbsolute === "$") {
        return match;
      }

      /*
       * References at or below the insertion point
       * move down with the totals section.
       */
      if (row >= insertionRow) {
        return `${column}${row + rowsToInsert}`;
      }

      return match;
    },
  );
}

/* =========================
   EXPAND ITEM TABLE
========================= */

function expandItemTable(worksheet, itemCount) {
  const templateCapacity = TEMPLATE.itemEndRow - TEMPLATE.itemStartRow + 1;

  if (itemCount <= templateCapacity) {
    return;
  }

  const rowsToInsert = itemCount - templateCapacity;

  const sourceRow = worksheet.getRow(TEMPLATE.itemEndRow);

  worksheet.insertRows(
    TEMPLATE.totalsStartRow,
    new Array(rowsToInsert).fill([]),
  );

  for (let i = 0; i < rowsToInsert; i++) {
    const targetRow = worksheet.getRow(TEMPLATE.itemEndRow + 1 + i);

    targetRow.height = sourceRow.height;

    sourceRow.eachCell({ includeEmpty: true }, (sourceCell, columnNumber) => {
      const targetCell = targetRow.getCell(columnNumber);

      targetCell.style = JSON.parse(JSON.stringify(sourceCell.style));

      targetCell.font = JSON.parse(JSON.stringify(sourceCell.font));

      targetCell.alignment = JSON.parse(JSON.stringify(sourceCell.alignment));

      targetCell.border = JSON.parse(JSON.stringify(sourceCell.border));

      targetCell.fill = JSON.parse(JSON.stringify(sourceCell.fill));

      targetCell.numFmt = sourceCell.numFmt;
    });
  }
}

function populateLineItems(worksheet, items) {
  /*
   * Convert the template's shared formulas in column I
   * into independent formulas for every available item row.
   */
  for (
    let rowNumber = TEMPLATE.itemStartRow;
    rowNumber <= TEMPLATE.itemEndRow;
    rowNumber++
  ) {
    const totalCell = worksheet.getCell(`I${rowNumber}`);

    totalCell.value = null;

    totalCell.model.formula = undefined;
    totalCell.model.sharedFormula = undefined;
    totalCell.model.shareType = undefined;
    totalCell.model.ref = undefined;

    totalCell.value = {
      formula: `IF(H${rowNumber},H${rowNumber}*B${rowNumber},"")`,
    };

    totalCell.model.sharedFormula = undefined;
    totalCell.model.shareType = undefined;
    totalCell.model.ref = undefined;
  }

  /*
   * Populate the actual products.
   */
  items.forEach((item, index) => {
    const rowNumber = TEMPLATE.itemStartRow + index;
    const row = worksheet.getRow(rowNumber);

    row.getCell("B").value = item.quantity;
    row.getCell("C").value = item.name;
    row.getCell("H").value = Number(item.unit_price);

    row.getCell("I").value = {
      formula: `IF(H${rowNumber},H${rowNumber}*B${rowNumber},"")`,
      result: Number(item.unit_price) * Number(item.quantity),
    };

    row.commit();
  });
}

/* =========================
   UPDATE TOTAL FORMULAS
========================= */

function updateTotalFormulas(worksheet, itemCount) {
  if (itemCount === 0) {
    return;
  }

  const templateCapacity = TEMPLATE.itemEndRow - TEMPLATE.itemStartRow + 1;

  const extraRows = Math.max(0, itemCount - templateCapacity);

  const subtotalRow = TEMPLATE.totalsStartRow + extraRows;
  const discountRow = subtotalRow + 1;
  const vatRow = subtotalRow + 2;
  const totalRow = subtotalRow + 3;

  const itemEndRow = TEMPLATE.itemStartRow + itemCount - 1;

  /* =========================
     CALCULATE SUBTOTAL
  ========================= */

  let subtotal = 0;

  for (
    let rowNumber = TEMPLATE.itemStartRow;
    rowNumber <= itemEndRow;
    rowNumber++
  ) {
    const quantity = Number(worksheet.getCell(`B${rowNumber}`).value || 0);

    const unitPrice = Number(worksheet.getCell(`H${rowNumber}`).value || 0);

    subtotal += quantity * unitPrice;
  }

  /* =========================
     SUBTOTAL
  ========================= */

  worksheet.getCell(`I${subtotalRow}`).value = {
    formula: `SUM(I${TEMPLATE.itemStartRow}:I${itemEndRow})`,
    result: subtotal,
  };

  /* =========================
     DISCOUNT
  ========================= */

  const discount = Number(worksheet.getCell(`I${discountRow}`).value || 0);

  /* =========================
     VAT
  ========================= */

  const vatCell = worksheet.getCell(`I${vatRow}`);

  let vat = 0;

  if (typeof vatCell.value === "object" && vatCell.value?.formula) {
    const formula = vatCell.value.formula;

    const percentageMatch = formula.match(/(\d+(?:\.\d+)?)%/);

    if (percentageMatch) {
      const percentage = Number(percentageMatch[1]);

      vat = (subtotal - discount) * (percentage / 100);

      vatCell.value = {
        formula,
        result: vat,
      };
    }
  } else {
    vat = Number(vatCell.value || 0);
  }

  /* =========================
     TOTAL
  ========================= */

  const totalCell = worksheet.getCell(`I${totalRow}`);

  if (typeof totalCell.value === "object" && totalCell.value?.formula) {
    totalCell.value = {
      formula: totalCell.value.formula,
      result: subtotal - discount + vat,
    };
  }
}

/* =========================
   INSERT COMPANY LOGO
========================= */

const fs = require("fs");

async function insertCompanyLogo(workbook, worksheet, settings) {
  if (!settings.company_logo_path) {
    return;
  }

  const logoPath = path.join(__dirname, "..", settings.company_logo_path);

  if (!fs.existsSync(logoPath)) {
    return;
  }

  const extension = path.extname(logoPath).replace(".", "").toLowerCase();

  const imageId = workbook.addImage({
    filename: logoPath,
    extension,
  });

  worksheet.addImage(imageId, {
    tl: { col: 0.3, row: 0.3 },
    ext: {
      width: 140,
      height: 80,
    },
  });
}

/* =========================
   GENERATE PROFORMA
========================= */

async function generateProformaInvoice(dispatch) {
  const { workbook, settings } = await loadInvoiceTemplate();

  const worksheet = workbook.worksheets[0];

  const invoiceNumber = await generateInvoiceNumber(settings);

  const preparedBy = await getPreparedBy(dispatch.staff_id);

  const invoiceDate = new Date();

  const validityDays = Number(settings.invoice_validity_days ?? 14);

  const validTillDate = new Date(invoiceDate);

  validTillDate.setDate(validTillDate.getDate() + validityDays);

  const itemRows =
    dispatch.items ?? (dispatch.id ? await getDispatchItems(dispatch.id) : []);

  const invoiceData = {
    company: {
      name: settings.company_name,
      address: settings.company_address,
      phone: settings.company_phone,
      email: settings.company_email,
      website: settings.company_website,
      vat: settings.company_vat,
      logo: settings.company_logo_path,
      currency: settings.currency_symbol,
    },

    invoice: {
      number: invoiceNumber,
      date: formatInvoiceDate(invoiceDate),
      validTill: formatInvoiceDate(validTillDate),
    },

    customer: {
      name: dispatch.customer_name,
      address: dispatch.location,
      phone: dispatch.contact,
      contactPerson: dispatch.contact_person,
    },

    preparedBy: {
      name: preparedBy.username,
      telephone: preparedBy.telephone,
    },

    items: itemRows,
  };

  expandItemTable(worksheet, invoiceData.items.length);

  replacePlaceholders(worksheet, {
    company_name: invoiceData.company.name,
    company_address: invoiceData.company.address,
    company_phone: invoiceData.company.phone,
    company_email: invoiceData.company.email,
    company_website: invoiceData.company.website,
    company_vat: invoiceData.company.vat,

    invoice_number: invoiceData.invoice.number,
    invoice_date: invoiceData.invoice.date,
    valid_till: invoiceData.invoice.validTill,

    customer_name: invoiceData.customer.name,
    customer_address: invoiceData.customer.address,
    customer_phone: invoiceData.customer.phone,
    contact_person: invoiceData.customer.contactPerson,

    prepared_by: invoiceData.preparedBy.name,
    prepared_by_contact: invoiceData.preparedBy.telephone,

    currency: invoiceData.company.currency,
  });

  populateLineItems(worksheet, invoiceData.items);

  updateTotalFormulas(worksheet, invoiceData.items.length);

  await insertCompanyLogo(workbook, worksheet, settings);

  return {
    workbook,
    settings,
  };
}

async function calculateTemplateTotals(items) {
  const { workbook } = await loadInvoiceTemplate();

  const worksheet = workbook.worksheets[0];

  let subtotal = 0;

  items.forEach((item) => {
    subtotal +=
      Number(item.quantity || 0) *
      Number(item.unit_price || 0);
  });

  const discount = Number(
    worksheet.getCell("I46").value || 0
  );

  const vatCell = worksheet.getCell("I47");

  let vat = 0;

  if (
    typeof vatCell.value === "object" &&
    vatCell.value?.formula
  ) {
    const formula = vatCell.value.formula;

    const percentageMatch = formula.match(
      /(\d+(?:\.\d+)?)%/
    );

    if (percentageMatch) {
      const percentage = Number(percentageMatch[1]);

      vat =
        (subtotal - discount) *
        (percentage / 100);
    }
  } else {
    vat = Number(vatCell.value || 0);
  }

  const grandTotal =
    subtotal - discount + vat;

  return {
    subtotal,
    discount,
    vat,
    grandTotal,
  };
}

module.exports = {
  generateProformaInvoice,
  calculateTemplateTotals,
};
