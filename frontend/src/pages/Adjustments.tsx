import { useEffect, useMemo, useState } from "react";

import { SlidersHorizontal } from "lucide-react";

import DocumentTemplatesSection from "../components/settings/DocumentTemplatesSection";

import CompanyInformationSection from "../components/settings/CompanyInformationSection";

import toast from "react-hot-toast";

import CurrencyPricingSection from "../components/settings/CurrencyPricingSection";

import PageHeader from "../components/PageHeader";

import PageLoader from "../components/PageLoader";


import DocumentNumberingSection from "../components/settings/DocumentNumberingSection";

import { useSettingsStore } from "../store/settingsStore";

function Adjustments() {
  const { settings, loading, fetchSettings, updateSettings } =
    useSettingsStore();

  const [baseCurrency, setBaseCurrency] = useState("USD");

  const [displayCurrency, setDisplayCurrency] = useState("GHS");

  const [currencySymbol, setCurrencySymbol] = useState("GH₵");

  const [baseCurrencyExchangeRate, setBaseCurrencyExchangeRate] =
    useState(15.5);

  const [companyMultiplier, setCompanyMultiplier] = useState(1.25);

  const [invoiceValidityDays, setInvoiceValidityDays] = useState(14);

  const [invoiceVatRate, setInvoiceVatRate] = useState(0);

  const [companyName, setCompanyName] = useState("");

  const [companyAddress, setCompanyAddress] = useState("");

  const [companyPhone, setCompanyPhone] = useState("");

  const [companyEmail, setCompanyEmail] = useState("");

  const [companyWebsite, setCompanyWebsite] = useState("");

  const [companyVat, setCompanyVat] = useState("");

  const [documentNumbering, setDocumentNumbering] = useState({
    invoicePrefix: "INV",
    invoiceNextNumber: 1,
    invoiceNumberLength: 6,
  });




  const [invoiceTemplatePath, setInvoiceTemplatePath] = useState("");

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (!settings) return;

    setBaseCurrency(settings.base_currency);

    setDisplayCurrency(settings.display_currency);
    setCurrencySymbol(settings.currency_symbol);
    setBaseCurrencyExchangeRate(settings.usd_exchange_rate);
    setCompanyMultiplier(settings.company_multiplier);
    setInvoiceValidityDays(settings.invoice_validity_days ?? 14);
    setInvoiceVatRate(settings.invoice_vat_rate ?? 0);

    setCompanyName(settings.company_name ?? "");
    setCompanyAddress(settings.company_address ?? "");
    setCompanyPhone(settings.company_phone ?? "");
    setCompanyEmail(settings.company_email ?? "");
    setCompanyWebsite(settings.company_website ?? "");
    setCompanyVat(settings.company_vat ?? "");




    setInvoiceTemplatePath(settings.invoice_template_path ?? "");

    setDocumentNumbering({
      invoicePrefix: settings.invoice_prefix ?? "INV",
      invoiceNextNumber: settings.invoice_next_number ?? 1,
      invoiceNumberLength: settings.invoice_number_length ?? 6,
    });
  }, [settings]);

  const effectiveRate = useMemo(() => {
    return baseCurrencyExchangeRate * companyMultiplier;
  }, [baseCurrencyExchangeRate, companyMultiplier]);

  const handleSave = async () => {
    const success = await updateSettings({
      // Currency & Pricing
      base_currency: baseCurrency,
      display_currency: displayCurrency,
      currency_symbol: currencySymbol,
      usd_exchange_rate: baseCurrencyExchangeRate,
      company_multiplier: companyMultiplier,
      invoice_validity_days: invoiceValidityDays,
      invoice_vat_rate: invoiceVatRate,

      // Company Information
      company_name: companyName,
      company_address: companyAddress,
      company_phone: companyPhone,
      company_email: companyEmail,
      company_website: companyWebsite,
      company_vat: companyVat,

      // Document Template
      invoice_template_path: invoiceTemplatePath,

      // Document Numbering
      invoice_prefix: documentNumbering.invoicePrefix,
      invoice_next_number: documentNumbering.invoiceNextNumber,
      invoice_number_length: documentNumbering.invoiceNumberLength,
    });

    if (success) {
      toast.success("Settings updated successfully");
    }
  };

  if (loading) {
    return <PageLoader text="Loading settings..." />;
  }

  return (
    <div>
      <PageHeader
        icon={<SlidersHorizontal size={32} className="text-slate-800" />}
        title="Adjustments"
        description="Manage currency conversion and business pricing settings."
      />

      <CompanyInformationSection
        companyName={companyName}
        setCompanyName={setCompanyName}
        companyAddress={companyAddress}
        setCompanyAddress={setCompanyAddress}
        companyPhone={companyPhone}
        setCompanyPhone={setCompanyPhone}
        companyEmail={companyEmail}
        setCompanyEmail={setCompanyEmail}
        companyWebsite={companyWebsite}
        setCompanyWebsite={setCompanyWebsite}
        companyVat={companyVat}
        setCompanyVat={setCompanyVat}
      />

      <DocumentNumberingSection
        value={documentNumbering}
        onChange={setDocumentNumbering}
      />

      <div className="erp-card erp-section">
        <div className="mb-4">
          <h2 className="erp-section-title">Invoice Validity</h2>

          <p className="text-sm text-slate-500">
            Set the default validity period for Proforma Invoices.
          </p>
        </div>

        <div className="max-w-sm">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Validity Period (Days)
          </label>

          <input
            type="number"
            min="1"
            value={invoiceValidityDays}
            onChange={(e) => setInvoiceValidityDays(Number(e.target.value))}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#3155d9] focus:ring-2 focus:ring-[#3155d9]/10"
          />

          <p className="mt-2 text-xs text-slate-500">
            Default: 14 days from the Proforma Invoice date.
          </p>
        </div>
      </div>

      <DocumentTemplatesSection
        invoiceTemplatePath={invoiceTemplatePath}
        setInvoiceTemplatePath={setInvoiceTemplatePath}
      />

      <CurrencyPricingSection
        baseCurrency={baseCurrency}
        setBaseCurrency={setBaseCurrency}
        displayCurrency={displayCurrency}
        setDisplayCurrency={setDisplayCurrency}
        currencySymbol={currencySymbol}
        setCurrencySymbol={setCurrencySymbol}
        baseCurrencyExchangeRate={baseCurrencyExchangeRate}
        setBaseCurrencyExchangeRate={setBaseCurrencyExchangeRate}
        companyMultiplier={companyMultiplier}
        setCompanyMultiplier={setCompanyMultiplier}
        effectiveRate={effectiveRate}
      />

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          className="rounded-xl bg-[#3155d9] px-6 py-3 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-[#2848bd] hover:shadow-md"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}

export default Adjustments;
