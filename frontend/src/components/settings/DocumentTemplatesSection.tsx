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
    <div className="bg-white rounded-3xl border border-gray-200 p-8 max-w-3xl mt-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Document Templates
      </h2>

      <div className="grid gap-6">
        <FileUploadField
          label="Invoice Template"
          value={invoiceTemplatePath}
          type="invoice"
          accept=".xlsx,.xlsm"
          onUploaded={setInvoiceTemplatePath}
        />

        <FileUploadField
          label="Quotation Template"
          value={quotationTemplatePath}
          type="quotation"
          accept=".xlsx,.xlsm"
          onUploaded={setQuotationTemplatePath}
        />

        <FileUploadField
          label="Purchase Order Template"
          value={purchaseOrderTemplatePath}
          type="purchase_order"
          accept=".xlsx,.xlsm"
          onUploaded={setPurchaseOrderTemplatePath}
        />

        <FileUploadField
          label="Delivery Note Template"
          value={deliveryNoteTemplatePath}
          type="delivery_note"
          accept=".xlsx,.xlsm"
          onUploaded={setDeliveryNoteTemplatePath}
        />
      </div>
    </div>
  );
}

export default DocumentTemplatesSection;
