type CurrencyPricingSectionProps = {
  displayCurrency: string;
  setDisplayCurrency: (value: string) => void;

  currencySymbol: string;
  setCurrencySymbol: (value: string) => void;

  usdExchangeRate: number;
  setUsdExchangeRate: (value: number) => void;

  companyMultiplier: number;
  setCompanyMultiplier: (value: number) => void;

  effectiveRate: number;

  onSave: () => void;
};

function CurrencyPricingSection({
  displayCurrency,
  setDisplayCurrency,
  currencySymbol,
  setCurrencySymbol,
  usdExchangeRate,
  setUsdExchangeRate,
  companyMultiplier,
  setCompanyMultiplier,
  effectiveRate,
  onSave,
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

          <input
            value="USD"
            disabled
            className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-100"
          />
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
            USD Exchange Rate
          </label>

          <input
            type="number"
            step="0.01"
            value={usdExchangeRate}
            onChange={(e) => setUsdExchangeRate(Number(e.target.value))}
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

        <button
          onClick={onSave}
          className="bg-black hover:bg-gray-800 transition text-white px-6 py-3 rounded-2xl font-semibold"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

export default CurrencyPricingSection;