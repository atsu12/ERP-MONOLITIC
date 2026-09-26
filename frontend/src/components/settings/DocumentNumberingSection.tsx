type DocumentNumberingSectionProps = {
  value: {
    invoicePrefix: string;
    invoiceNextNumber: number;
    invoiceNumberLength: number;
  };
  onChange: (value: {
    invoicePrefix: string;
    invoiceNextNumber: number;
    invoiceNumberLength: number;
  }) => void;
};

function DocumentNumberingSection({
  value,
  onChange,
}: DocumentNumberingSectionProps) {
  const { invoicePrefix, invoiceNextNumber, invoiceNumberLength } = value;

  const preview = `${invoicePrefix}-${invoiceNextNumber
    .toString()
    .padStart(invoiceNumberLength, "0")}`;

  return (
    <div className="erp-card max-w-5xl">
      <h2 className="erp-section-title mb-6">
        Document Numbering
      </h2>

      <div className="grid gap-6">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Invoice Prefix
          </label>

          <input
            value={invoicePrefix}
            onChange={(e) =>
              onChange({
                ...value,
                invoicePrefix: e.target.value.toUpperCase(),
              })
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#3155d9] focus:ring-2 focus:ring-[#3155d9]/10"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Next Invoice Number
          </label>

          <input
            type="number"
            min={1}
            value={invoiceNextNumber}
            onChange={(e) =>
              onChange({
                ...value,
                invoiceNextNumber: Number(e.target.value),
              })
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#3155d9] focus:ring-2 focus:ring-[#3155d9]/10"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Number Length
          </label>

          <input
            type="number"
            min={1}
            max={12}
            value={invoiceNumberLength}
            onChange={(e) =>
              onChange({
                ...value,
                invoiceNumberLength: Number(e.target.value),
              })
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#3155d9] focus:ring-2 focus:ring-[#3155d9]/10"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Preview
          </label>

          <input
            value={preview}
            disabled
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700"
          />
        </div>
      </div>
    </div>
  );
}

export default DocumentNumberingSection;
