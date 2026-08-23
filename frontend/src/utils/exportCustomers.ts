import { exportExcel } from "./exportExcel";

export function exportCustomers(
  customers: any[],
  filters: Record<string, string> = {},
) {
  const rows = customers.map((customer) => ({
    "Customer ID": customer.id,

    Customer: customer.customer_name,

    Contact: customer.contact || "",

    "Contact Person": customer.contact_person || "",

    Location: customer.location || "",

    "Date Added": customer.created_at
      ? new Date(customer.created_at).toLocaleDateString("en-GB")
      : "",
  }));

  const today = new Date().toISOString().slice(0, 10);

  exportExcel({
    title: "Customer Records",

    rows,

    filters,

    sheetName: "Customers",

    fileName: `customer-records-${today}.xlsx`,
  });
}
