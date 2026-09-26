import FileUploadField from "./FileUploadField";

type DocumentTemplatesSectionProps = {
  invoiceTemplatePath: string;
  setInvoiceTemplatePath: (value: string) => void;
};

function DocumentTemplatesSection({
  invoiceTemplatePath,
  setInvoiceTemplatePath,
}: DocumentTemplatesSectionProps) {
  return (
    <div className="erp-card">
      <div className="mb-6">
        <h2 className="erp-section-title">Company Document Template</h2>
        <p className="mt-1 text-sm text-slate-500">
          Configure the company document template used when generating customer invoices.
        </p>
      </div>

      <section>
        <FileUploadField
          label="Invoice Template"
          value={invoiceTemplatePath}
          type="invoice"
          accept=".xlsx,.xlsm"
          onUploaded={setInvoiceTemplatePath}
        />

        <p className="mt-3 text-sm text-slate-500">
          Used when printing customer invoices. Product lines, totals, taxes
          and company information are automatically inserted.
        </p>
      </section>
    </div>
  );
}

export default DocumentTemplatesSection;
