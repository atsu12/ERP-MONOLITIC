type CompanyInformationSectionProps = {
  companyName: string;
  setCompanyName: (value: string) => void;

  companyAddress: string;
  setCompanyAddress: (value: string) => void;

  companyPhone: string;
  setCompanyPhone: (value: string) => void;

  companyEmail: string;
  setCompanyEmail: (value: string) => void;

  companyWebsite: string;
  setCompanyWebsite: (value: string) => void;

  companyVat: string;
  setCompanyVat: (value: string) => void;
};

function CompanyInformationSection({
  companyName,
  setCompanyName,

  companyAddress,
  setCompanyAddress,

  companyPhone,
  setCompanyPhone,

  companyEmail,
  setCompanyEmail,

  companyWebsite,
  setCompanyWebsite,

  companyVat,
  setCompanyVat,
}: CompanyInformationSectionProps) {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-8 max-w-3xl">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Company Information
      </h2>

      <div className="grid gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Name
          </label>

          <input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address
          </label>

          <textarea
            rows={3}
            value={companyAddress}
            onChange={(e) => setCompanyAddress(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone
          </label>

          <input
            value={companyPhone}
            onChange={(e) => setCompanyPhone(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>

          <input
            type="email"
            value={companyEmail}
            onChange={(e) => setCompanyEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Website
          </label>

          <input
            value={companyWebsite}
            onChange={(e) => setCompanyWebsite(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tax (VAT/TIN)
          </label>

          <input
            value={companyVat}
            onChange={(e) => setCompanyVat(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300"
          />
        </div>
      </div>
    </div>
  );
}

export default CompanyInformationSection;
