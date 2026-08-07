import FileUploadField from "./FileUploadField";

type DocumentTemplatesSectionProps = {
  invoiceTemplatePath: string;
  setInvoiceTemplatePath: (value: string) => void;

  quotationTemplatePath: string;
  setQuotationTemplatePath: (value: string) => void;

  purchaseOrderTemplatePath: string;
  setPurchaseOrderTemplatePath: (value: string) => void;

  deliveryNoteTemplatePath: string;
  setDeliveryNoteTemplatePath: (value: string) => void;
};

function DocumentTemplatesSection({
  invoiceTemplatePath,
  setInvoiceTemplatePath,

  quotationTemplatePath,
  setQuotationTemplatePath,

  purchaseOrderTemplatePath,
  setPurchaseOrderTemplatePath,

  deliveryNoteTemplatePath,
  setDeliveryNoteTemplatePath,
}: DocumentTemplatesSectionProps) {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-8 max-w-5xl mt-8">
      {/* ================================================= */}
      {/* SECTION HEADER                                    */}
      {/* ================================================= */}

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Document Templates</h2>

        <p className="mt-2 text-gray-600 max-w-3xl">
          Upload Microsoft Excel templates used when generating business
          documents. During printing, the ERP automatically fills company,
          customer, inventory and transaction data into these templates.
        </p>
      </div>

      <div className="space-y-10">
        <section>
          <FileUploadField
            label="Invoice Template"
            value={invoiceTemplatePath}
            type="invoice"
            accept=".xlsx,.xlsm"
            onUploaded={setInvoiceTemplatePath}
          />

          <p className="mt-3 text-sm text-gray-600">
            Used when printing customer invoices. Product lines, totals, taxes
            and company information are automatically inserted.
          </p>
        </section>

        <section>
          <FileUploadField
            label="Quotation Template"
            value={quotationTemplatePath}
            type="quotation"
            accept=".xlsx,.xlsm"
            onUploaded={setQuotationTemplatePath}
          />

          <p className="mt-3 text-sm text-gray-600">
            Used when generating quotations before a sale is confirmed.
          </p>
        </section>

        <section>
          <FileUploadField
            label="Purchase Order Template"
            value={purchaseOrderTemplatePath}
            type="purchase_order"
            accept=".xlsx,.xlsm"
            onUploaded={setPurchaseOrderTemplatePath}
          />

          <p className="mt-3 text-sm text-gray-600">
            Used when issuing purchase orders to suppliers.
          </p>
        </section>

        <section>
          <FileUploadField
            label="Delivery Note Template"
            value={deliveryNoteTemplatePath}
            type="delivery_note"
            accept=".xlsx,.xlsm"
            onUploaded={setDeliveryNoteTemplatePath}
          />

          <p className="mt-3 text-sm text-gray-600">
            Used when printing delivery notes during dispatch operations.
          </p>
        </section>
      </div>
    </div>
  );
}

export default DocumentTemplatesSection;
