const ExcelJS = require("exceljs");

const path = require("path");

const db = require("../configs/db").promise();

/* ===========================================================
   TEMPLATE CONFIGURATION
=========================================================== */

const TEMPLATE = {
  itemStartRow: 23,
  itemEndRow: 34,

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
   POPULATE LINE ITEMS
========================= */

/* =========================
   EXPAND ITEM TABLE
========================= */

function expandItemTable(worksheet, itemCount) {
  const templateCapacity = TEMPLATE.itemEndRow - TEMPLATE.itemStartRow + 1;

  if (itemCount <= templateCapacity) {
    return;
  }

  const rowsToInsert = itemCount - templateCapacity;

  worksheet.duplicateRow(TEMPLATE.itemEndRow, rowsToInsert, true);
}

function populateLineItems(worksheet, items) {
  items.forEach((item, index) => {
    const row = worksheet.getRow(TEMPLATE.itemStartRow + index);

    row.getCell("B").value = item.quantity;

    row.getCell("C").value = item.name;

    row.getCell("H").value = Number(item.unit_price);

    /*
      Leave column I alone.

      The template already
      contains formulas.
    */

    row.commit();
  });
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

  const itemRows =
  dispatch.items ??
  (dispatch.id ? await getDispatchItems(dispatch.id) : []);

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
      date: new Date().toLocaleDateString(),
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

  replacePlaceholders(worksheet, {
    company_name: invoiceData.company.name,
    company_address: invoiceData.company.address,
    company_phone: invoiceData.company.phone,
    company_email: invoiceData.company.email,
    company_website: invoiceData.company.website,
    company_vat: invoiceData.company.vat,

    invoice_number: invoiceData.invoice.number,
    invoice_date: invoiceData.invoice.date,

    customer_name: invoiceData.customer.name,
    customer_address: invoiceData.customer.address,
    customer_phone: invoiceData.customer.phone,
    contact_person: invoiceData.customer.contactPerson,

    prepared_by: invoiceData.preparedBy.name,
    prepared_by_contact: invoiceData.preparedBy.telephone,

    currency: invoiceData.company.currency,
  });

  expandItemTable(worksheet, invoiceData.items.length);

  populateLineItems(worksheet, invoiceData.items);

    await insertCompanyLogo(workbook, worksheet, settings);

  return {
    workbook,
    settings,
  };
}

module.exports = {
  generateProformaInvoice,
};
