import FileUploadField from "./FileUploadField";

type BrandingSectionProps = {
  companyLogoPath: string;
  setCompanyLogoPath: (value: string) => void;

  companyHeader: string;
  setCompanyHeader: (value: string) => void;

  companyFooter: string;
  setCompanyFooter: (value: string) => void;
};

function BrandingSection({
  companyLogoPath,
  setCompanyLogoPath,

  companyHeader,
  setCompanyHeader,

  companyFooter,
  setCompanyFooter,
}: BrandingSectionProps) {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-8 max-w-5xl mt-8">
      {/* ================================================= */}
      {/* SECTION HEADER                                    */}
      {/* ================================================= */}

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Company Branding</h2>

        <p className="mt-2 text-gray-600 max-w-3xl">
          Configure your company's visual identity and printed document
          appearance. These settings are automatically used throughout the ERP
          whenever invoices, quotations, purchase orders, delivery notes or
          reports are generated.
        </p>
      </div>

      {/* ================================================= */}
      {/* COMPANY LOGO                                      */}
      {/* ================================================= */}

      <section className="mb-10">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Company Logo</h3>

          <p className="mt-1 text-sm text-gray-600">
            Upload the official company logo that will appear on printed
            documents and reports.
          </p>

          <ul className="mt-3 ml-5 list-disc text-sm text-gray-500 space-y-1">
            <li>Supported formats: PNG, JPG, JPEG, SVG and WEBP.</li>
            <li>Recommended size: 500 × 500 pixels or larger.</li>
            <li>Transparent backgrounds are recommended.</li>
            <li>
              Uploading a new logo automatically replaces the previous one.
            </li>
          </ul>
        </div>

        <FileUploadField
          label="Company Logo"
          value={companyLogoPath}
          type="logo"
          accept=".png,.jpg,.jpeg,.svg,.webp"
          onUploaded={setCompanyLogoPath}
        />
      </section>

      {/* ================================================= */}
      {/* DOCUMENT HEADER                                   */}
      {/* ================================================= */}

      <section className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900">Document Header</h3>

        <p className="mt-1 mb-3 text-sm text-gray-600">
          Optional text displayed near the top of printed documents such as
          invoices, quotations and reports.
        </p>

        <textarea
          rows={4}
          value={companyHeader}
          onChange={(e) => setCompanyHeader(e.target.value)}
          placeholder="Example: Excellence • Integrity • Innovation"
          className="w-full rounded-xl border border-gray-300 p-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </section>

      {/* ================================================= */}
      {/* DOCUMENT FOOTER                                   */}
      {/* ================================================= */}

      <section>
        <h3 className="text-lg font-semibold text-gray-900">Document Footer</h3>

        <p className="mt-1 mb-3 text-sm text-gray-600">
          Optional text displayed at the bottom of printed documents. This can
          include thank-you notes, legal notices or banking information.
        </p>

        <textarea
          rows={4}
          value={companyFooter}
          onChange={(e) => setCompanyFooter(e.target.value)}
          placeholder="Example: Thank you for doing business with us."
          className="w-full rounded-xl border border-gray-300 p-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </section>
    </div>
  );
}

export default BrandingSection;
