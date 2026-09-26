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
    <div className="erp-card erp-section">
      <div className="mb-6">
        <h2 className="erp-section-title">Company Information</h2>
        <p className="mt-1 text-sm text-slate-500">
          Manage the company details used throughout the ERP and business
          documents.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Company Name
          </label>
          <input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#3155d9] focus:ring-2 focus:ring-[#3155d9]/10"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Phone
          </label>
          <input
            value={companyPhone}
            onChange={(e) => setCompanyPhone(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#3155d9] focus:ring-2 focus:ring-[#3155d9]/10"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Email
          </label>
          <input
            type="email"
            value={companyEmail}
            onChange={(e) => setCompanyEmail(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#3155d9] focus:ring-2 focus:ring-[#3155d9]/10"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Website
          </label>
          <input
            value={companyWebsite}
            onChange={(e) => setCompanyWebsite(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#3155d9] focus:ring-2 focus:ring-[#3155d9]/10"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Tax (VAT/TIN)
          </label>
          <input
            value={companyVat}
            onChange={(e) => setCompanyVat(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#3155d9] focus:ring-2 focus:ring-[#3155d9]/10"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Address
          </label>
          <textarea
            rows={3}
            value={companyAddress}
            onChange={(e) => setCompanyAddress(e.target.value)}
            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#3155d9] focus:ring-2 focus:ring-[#3155d9]/10"
          />
        </div>
      </div>
    </div>
  );
}

export default CompanyInformationSection;
