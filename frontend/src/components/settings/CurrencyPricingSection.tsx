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
    <div className="bg-white rounded-3xl border border-gray-200 p-8 max-w-3xl">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Currency & Pricing
      </h2>

      <div className="grid gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Base Currency
          </label>

          <select
            value={baseCurrency}
            onChange={(e) => setBaseCurrency(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white"
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Display Currency
          </label>

          <input
            value={displayCurrency}
            onChange={(e) => setDisplayCurrency(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Currency Symbol
          </label>

          <input
            value={currencySymbol}
            onChange={(e) => setCurrencySymbol(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Base Currency Exchange Rate
          </label>

          <input
            type="number"
            step="0.01"
            value={baseCurrencyExchangeRate}
            onChange={(e) =>
              setBaseCurrencyExchangeRate(Number(e.target.value))
            }
            className="w-full px-4 py-3 rounded-xl border border-gray-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Multiplier
          </label>

          <input
            type="number"
            step="0.01"
            value={companyMultiplier}
            onChange={(e) => setCompanyMultiplier(Number(e.target.value))}
            className="w-full px-4 py-3 rounded-xl border border-gray-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Effective Rate
          </label>

          <input
            value={effectiveRate.toFixed(2)}
            disabled
            className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-100"
          />
        </div>
      </div>
    </div>
  );
}

export default CurrencyPricingSection;
