import { useEffect, useMemo, useState } from "react";

import { SlidersHorizontal } from "lucide-react";

import toast from "react-hot-toast";

import PageHeader from "../components/PageHeader";

import PageLoader from "../components/PageLoader";

import { useSettingsStore } from "../store/settingsStore";

function Adjustments() {
  const {
    settings,
    loading,
    fetchSettings,
    updateSettings,
  } = useSettingsStore();

  const [displayCurrency, setDisplayCurrency] = useState("GHS");

  const [currencySymbol, setCurrencySymbol] = useState("GH₵");

  const [usdExchangeRate, setUsdExchangeRate] = useState(15.5);

  const [companyMultiplier, setCompanyMultiplier] = useState(1.25);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (!settings) return;

    setDisplayCurrency(settings.display_currency);

    setCurrencySymbol(settings.currency_symbol);

    setUsdExchangeRate(settings.usd_exchange_rate);

    setCompanyMultiplier(settings.company_multiplier);
  }, [settings]);

  const effectiveRate = useMemo(() => {
    return usdExchangeRate * companyMultiplier;
  }, [usdExchangeRate, companyMultiplier]);

  if (loading) {
    return <PageLoader text="Loading settings..." />;
  }

  return (
    <div>
      <PageHeader
        icon={
          <SlidersHorizontal
            size={32}
            className="text-gray-800"
          />
        }
        title="Adjustments"
        description="Manage currency conversion and business pricing settings."
      />

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
              onChange={(e) =>
                setDisplayCurrency(e.target.value)
              }
              className="w-full px-4 py-3 rounded-xl border border-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency Symbol
            </label>

            <input
              value={currencySymbol}
              onChange={(e) =>
                setCurrencySymbol(e.target.value)
              }
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
              onChange={(e) =>
                setUsdExchangeRate(Number(e.target.value))
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
              onChange={(e) =>
                setCompanyMultiplier(Number(e.target.value))
              }
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
            onClick={async () => {
              const success = await updateSettings({
                display_currency: displayCurrency,
                currency_symbol: currencySymbol,
                usd_exchange_rate: usdExchangeRate,
                company_multiplier: companyMultiplier,
              });

              if (success) {
                toast.success(
                  "Settings updated successfully"
                );
              }
            }}
            className="bg-black hover:bg-gray-800 transition text-white px-6 py-3 rounded-2xl font-semibold"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default Adjustments;