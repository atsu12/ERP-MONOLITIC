import { useState } from "react";

import {
  BookOpen,
  Package,
  Boxes,
  PackageMinus,
  Wallet,
  ScanLine,
  ArrowLeftRight,
  Warehouse,
  FileText,
  Activity,
  Users,
  UserRound,
  SlidersHorizontal,
  Download,
  ChevronDown,
} from "lucide-react";

function Help() {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const sections = [
    {
      title: "Dashboard",
      icon: BookOpen,
      description:
        "The Dashboard provides a quick overview of the system and current inventory activity.",
      steps: [
        "Review the main inventory figures.",
        "Use the available dashboard information to identify items that need attention.",
        "Use the navigation menu to move to the relevant module.",
      ],
    },
    {
      title: "Products",
      icon: Package,
      description:
        "Products are definitions of the items your business manages.",
      steps: [
        "Create a product with its name, brand, category and price.",
        "Search and filter products when needed.",
        "Edit product information when product details change.",
        "Delete products only when authorized.",
        "Creating a product does not create stock.",
      ],
    },
    {
      title: "Bulk Product Import",
      icon: Package,
      description:
        "Bulk Import allows multiple product definitions to be added from an Excel file.",
      steps: [
        "Prepare an Excel file with Product Name, Brand, Category and Price in columns A–D.",
        "Do not add a header row. Row 1 must contain the first product.",
        "Select the Excel file from the Products page.",
        "The system validates the complete file before importing anything.",
        "If validation fails, the entire import is cancelled.",
        "Imported products do not automatically receive stock.",
      ],
    },
    {
      title: "Stock In",
      icon: Boxes,
      description:
        "Stock In is used when physical inventory enters the business.",
      steps: [
        "Select the product.",
        "Enter the quantity being received.",
        "Complete the stock-in operation.",
        "The inventory quantity is updated.",
      ],
    },
    {
      title: "Stock Out",
      icon: PackageMinus,
      description:
        "Stock Out is used when inventory leaves the business.",
      steps: [
        "Select the product.",
        "Enter the quantity leaving inventory.",
        "Complete the stock-out operation.",
        "The system records the inventory movement.",
      ],
    },
    {
      title: "Cashier",
      icon: Wallet,
      description:
        "The Cashier module is used for sales transactions.",
      steps: [
        "Select or identify the products being sold.",
        "Review the transaction details.",
        "Apply the required discount or VAT values when applicable.",
        "Complete the sale.",
      ],
    },
    {
      title: "Scan Inventory",
      icon: ScanLine,
      description:
        "Scan Inventory provides a faster way to identify products and work with inventory.",
      steps: [
        "Open Scan Inventory.",
        "Scan the supported product code.",
        "Review the product information returned by the system.",
        "Continue with the required inventory operation.",
      ],
    },
    {
      title: "Inventory Movements",
      icon: ArrowLeftRight,
      description:
        "Inventory Movements provides a history of stock activity.",
      steps: [
        "Review recorded inventory movements.",
        "Use the available filters to narrow the results.",
        "Use movement history when investigating stock changes.",
      ],
    },
    {
      title: "Warehouses",
      icon: Warehouse,
      description:
        "Warehouses are used to manage inventory locations and allocations.",
      steps: [
        "Open the Warehouses module.",
        "Select the warehouse you need to manage.",
        "Review the inventory associated with that warehouse.",
        "Use the available allocation controls when required.",
      ],
    },
    {
      title: "Reports",
      icon: FileText,
      description:
        "Reports provide authorized users with business and inventory information.",
      steps: [
        "Open Reports from the administration section.",
        "Select the relevant report information.",
        "Use available filters to investigate the required period or data.",
        "Review the results for operational or management decisions.",
      ],
    },
    {
      title: "Audit Log",
      icon: Activity,
      description:
        "The Audit Log records important system activity for administrators.",
      steps: [
        "Open Audit Log.",
        "Review recorded user and system activity.",
        "Use the available history when investigating changes or actions.",
      ],
    },
    {
      title: "Adjustments",
      icon: SlidersHorizontal,
      description:
        "Adjustments allow authorized administrators to correct inventory when necessary.",
      steps: [
        "Identify the product requiring an adjustment.",
        "Review the current inventory information.",
        "Enter the required adjustment.",
        "Confirm the adjustment carefully.",
      ],
    },
    {
      title: "Customers",
      icon: UserRound,
      description:
        "Customer Records stores customer information captured from completed sales.",
      steps: [
        "Open Customers from the navigation menu.",
        "Review customer records generated from completed sales.",
        "Review the customer name, contact, contact person, location and date added.",
        "Use the Export button to export the available customer records.",
        "The customer export is generated as an Excel workbook.",
        "The general export format includes the ERP company information and uploaded company logo.",
      ],
    },
    {
      title: "General Exports",
      icon: Download,
      description:
        "Applicable ERP modules provide Excel exports for operational and management data.",
      steps: [
        "Open the module containing the data you want to export.",
        "Use the available Export button.",
        "The exported workbook is formatted for practical review and reporting.",
        "The ERP company name and uploaded company logo are used in general exports when available.",
        "Where filters are available, the selected filter information can be included in the exported report.",
        "General exports are separate from invoice generation.",
      ],
    },
    {
      title: "Invoice Generation",
      icon: FileText,
      description:
        "Invoice generation is a separate document-generation system from the general ERP Excel exports.",
      steps: [
        "Invoice generation uses the invoice sample/template uploaded in ERP Settings.",
        "The uploaded invoice sample is used as the reference for the invoice layout and structure.",
        "Invoice generation is company-specific because each company can upload its own invoice sample.",
        "Do not expect general reports or exports to follow the uploaded invoice sample.",
        "General Excel exports use the ERP's standard reporting format instead.",
      ],
    },
    {
      title: "Users",
      icon: Users,
      description:
        "Administrators use Users to manage system accounts and access.",
      steps: [
        "Open Users.",
        "Create or manage authorized user accounts.",
        "Assign the appropriate system role.",
        "Review user access when responsibilities change.",
      ],
    },
  ];

  const toggleSection = (title: string) => {
    setOpenSection((current) => (current === title ? null : title));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="erp-page-title">User Guide</h1>

        <p className="erp-page-description">
          A practical guide to using the ZICO Business ERP system.
        </p>
      </div>

      <div className="erp-card p-6 shadow-[0_4px_18px_rgba(15,23,42,0.05)]">
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Getting Started
        </h2>

        <p className="text-slate-600 leading-relaxed">
          Use the sidebar to access the modules available to your role.
          Start with Products to define the items managed by the business,
          then use Stock In when physical inventory enters the business.
        </p>
      </div>

      <div className="space-y-4">
        {sections.map((section) => {
          const Icon = section.icon;
          const isOpen = openSection === section.title;

          return (
            <section
              key={section.title}
              className="erp-card shadow-[0_4px_18px_rgba(15,23,42,0.05)] overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggleSection(section.title)}
                className="w-full flex items-center justify-between gap-4 p-6 text-left hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-2xl bg-slate-50">
                    <Icon size={22} />
                  </div>

                  <h2 className="text-xl font-bold text-slate-900">
                    {section.title}
                  </h2>
                </div>

                <ChevronDown
                  size={22}
                  className={`shrink-0 transition-all duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-6 pb-6 border-t border-gray-100 pt-5">
                  <p className="text-slate-600 mb-4">
                    {section.description}
                  </p>

                  <ol className="space-y-2 list-decimal list-inside text-slate-700">
                    {section.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}
            </section>
          );
        })}
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-3">
          Important Inventory Rule
        </h2>

        <p className="text-slate-700 leading-relaxed">
          Products are product definitions. Inventory enters the system
          through Stock In. Creating a product or importing products from
          Excel does not automatically create inventory.
        </p>
      </div>
    </div>
  );
}

export default Help;