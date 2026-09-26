type CurrencyPricingSectionProps = {
  baseCurrency: string;
  setBaseCurrency: (value: string) => void;

  displayCurrency: string;
  setDisplayCurrency: (value: string) => void;

  currencySymbol: string;
  setCurrencySymbol: (value: string) => void;

  baseCurrencyExchangeRate: number;
  setBaseCurrencyExchangeRate: (value: number) => void;
  companyMultiplier: number;
  setCompanyMultiplier: (value: number) => void;

  effectiveRate: number;
};

function CurrencyPricingSection({
  baseCurrency,
  setBaseCurrency,

  displayCurrency,
  setDisplayCurrency,
  currencySymbol,
  setCurrencySymbol,
  baseCurrencyExchangeRate,
  setBaseCurrencyExchangeRate,
  companyMultiplier,
  setCompanyMultiplier,
  effectiveRate,
}: CurrencyPricingSectionProps) {
  return (
    <div className="erp-card max-w-5xl">
      <h2 className="erp-section-title mb-6">
        Currency & Pricing
      </h2>

      <div className="grid gap-6">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Base Currency
          </label>

          <select
            value={baseCurrency}
            onChange={(e) => setBaseCurrency(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 transition focus:border-[#3155d9] focus:outline-none focus:ring-2 focus:ring-[#3155d9]/10"
          >
            <option value="USD">USD — US Dollar</option>
            <option value="EUR">EUR — Euro</option>
            <option value="GBP">GBP — British Pound</option>
            <option value="CHF">CHF — Swiss Franc</option>
            <option value="JPY">JPY — Japanese Yen</option>
            <option value="CAD">CAD — Canadian Dollar</option>
            <option value="AUD">AUD — Australian Dollar</option>
            <option value="SGD">SGD — Singapore Dollar</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Display Currency
          </label>

          <input
            value={displayCurrency}
            onChange={(e) => setDisplayCurrency(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 transition focus:border-[#3155d9] focus:outline-none focus:ring-2 focus:ring-[#3155d9]/10"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Currency Symbol
          </label>

          <input
            value={currencySymbol}
            onChange={(e) => setCurrencySymbol(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 transition focus:border-[#3155d9] focus:outline-none focus:ring-2 focus:ring-[#3155d9]/10"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Base Currency Exchange Rate
          </label>

          <input
            type="number"
            step="0.01"
            value={baseCurrencyExchangeRate}
            onChange={(e) =>
              setBaseCurrencyExchangeRate(Number(e.target.value))
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 transition focus:border-[#3155d9] focus:outline-none focus:ring-2 focus:ring-[#3155d9]/10"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Company Multiplier
          </label>

          <input
            type="number"
            step="0.01"
            value={companyMultiplier}
            onChange={(e) => setCompanyMultiplier(Number(e.target.value))}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 transition focus:border-[#3155d9] focus:outline-none focus:ring-2 focus:ring-[#3155d9]/10"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Effective Rate
          </label>

          <input
            value={effectiveRate.toFixed(2)}
            disabled
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700"
          />
        </div>
      </div>
    </div>
  );
}

export default CurrencyPricingSection;
