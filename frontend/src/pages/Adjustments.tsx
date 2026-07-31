import { useEffect, useMemo, useState } from "react";

import { SlidersHorizontal } from "lucide-react";

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

  const [displayCurrency, setDisplayCurrency] = useState("GHS");

  const [currencySymbol, setCurrencySymbol] = useState("GH₵");

  const [usdExchangeRate, setUsdExchangeRate] = useState(15.5);

  const [companyMultiplier, setCompanyMultiplier] = useState(1.25);

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

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (!settings) return;

    setDisplayCurrency(settings.display_currency);
    setCurrencySymbol(settings.currency_symbol);
    setUsdExchangeRate(settings.usd_exchange_rate);
    setCompanyMultiplier(settings.company_multiplier);

    setCompanyName(settings.company_name ?? "");
    setCompanyAddress(settings.company_address ?? "");
    setCompanyPhone(settings.company_phone ?? "");
    setCompanyEmail(settings.company_email ?? "");
    setCompanyWebsite(settings.company_website ?? "");
    setCompanyVat(settings.company_vat ?? "");

    setDocumentNumbering({
      invoicePrefix: settings.invoice_prefix ?? "INV",
      invoiceNextNumber: settings.invoice_next_number ?? 1,
      invoiceNumberLength: settings.invoice_number_length ?? 6,
    });
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
        icon={<SlidersHorizontal size={32} className="text-gray-800" />}
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

      <CurrencyPricingSection
        displayCurrency={displayCurrency}
        setDisplayCurrency={setDisplayCurrency}
        currencySymbol={currencySymbol}
        setCurrencySymbol={setCurrencySymbol}
        usdExchangeRate={usdExchangeRate}
        setUsdExchangeRate={setUsdExchangeRate}
        companyMultiplier={companyMultiplier}
        setCompanyMultiplier={setCompanyMultiplier}
        effectiveRate={effectiveRate}
        onSave={async () => {
          const success = await updateSettings({
            // Currency & Pricing
            display_currency: displayCurrency,
            currency_symbol: currencySymbol,
            usd_exchange_rate: usdExchangeRate,
            company_multiplier: companyMultiplier,

            // Company Information
            company_name: companyName,
            company_address: companyAddress,
            company_phone: companyPhone,
            company_email: companyEmail,
            company_website: companyWebsite,
            company_vat: companyVat,

            // Document Numbering
            invoice_prefix: documentNumbering.invoicePrefix,
            invoice_next_number: documentNumbering.invoiceNextNumber,
            invoice_number_length: documentNumbering.invoiceNumberLength,
          });

          if (success) {
            toast.success("Settings updated successfully");
          }
        }}
      />
    </div>
  );
}

export default Adjustments;
