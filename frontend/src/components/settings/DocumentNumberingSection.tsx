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
    <div className="bg-white rounded-3xl border border-gray-200 p-8 max-w-3xl">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Document Numbering
      </h2>

      <div className="grid gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
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
            className="w-full px-4 py-3 rounded-xl border border-gray-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
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
            className="w-full px-4 py-3 rounded-xl border border-gray-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
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
            className="w-full px-4 py-3 rounded-xl border border-gray-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preview
          </label>

          <input
            value={preview}
            disabled
            className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-100"
          />
        </div>
      </div>
    </div>
  );
}

export default DocumentNumberingSection;
