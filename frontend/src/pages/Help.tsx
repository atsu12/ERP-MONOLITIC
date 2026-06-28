import {
  CircleHelp,
  BookOpen,
  ShieldCheck,
  ScanLine,
  Warehouse,
  ArrowRight
} from "lucide-react";

import PageHeader
  from "../components/PageHeader";

function Help() {

  const helpSections = [

    {
      id: 1,
      title: "Inventory Management",
      description:
        "Manage products, quantities, serialized stock, and operational inventory workflows.",
      icon: <BookOpen size={24} className="text-blue-700" />,
    },

    {
      id: 2,
      title: "Warehouse Operations",
      description:
        "Monitor warehouse distribution, transfers, and inventory allocation across locations.",
      icon: <Warehouse size={24} className="text-green-700" />,
    },

    {
      id: 3,
      title: "Barcode & Scanning",
      description:
        "Use the scanning module for serialized inventory intake and warehouse tracking.",
      icon: <ScanLine size={24} className="text-purple-700" />,
    },

    {
      id: 4,
      title: "Security & Access",
      description:
        "Role-based permissions help secure operational ERP modules and user activities.",
      icon: <ShieldCheck size={24} className="text-red-700" />,
    },

  ];

  return (

    <div>

      {/* HEADER */}

      <PageHeader
        icon={
          <CircleHelp
            size={32}
            className="text-gray-800"
          />
        }
        title="Help Center"
        description="Access ERP documentation and operational support resources."
      />

      {/* SUPPORT BANNER */}

      <div className="erp-card erp-section mb-8">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

          <div>

            <h2 className="text-3xl font-black text-gray-900 mb-2">

              Support

            </h2>

            <p className="text-gray-500 leading-relaxed max-w-2xl">

              Access operational guidance, warehouse workflows, and inventory management assistance.

            </p>

          </div>

          <div className="w-20 h-20 rounded-3xl bg-blue-100 flex items-center justify-center">

            <CircleHelp
              size={40}
              className="text-blue-700"
            />

          </div>

        </div>

      </div>

      {/* HELP MODULES */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {helpSections.map(
          (section) => (

            <div
              key={section.id}
              className="erp-card erp-section erp-hover-lift"
            >

              <div className="flex items-start gap-4">

                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">

                  {section.icon}

                </div>

                <div className="flex-1">

                  <h2 className="text-xl font-bold text-gray-900 mb-2">

                    {section.title}

                  </h2>

                  <p className="text-gray-500 leading-relaxed">

                    {section.description}

                  </p>

                  <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-gray-700">

                    Learn More

                    <ArrowRight
                      size={16}
                    />

                  </div>

                </div>

              </div>

            </div>

          )
        )}

      </div>

      {/* CONTACT SECTION */}

      <div className="erp-card erp-section mt-8">

        <h2 className="text-2xl font-bold text-gray-900 mb-4">

          Operational Assistance

        </h2>

        <p className="text-gray-500 leading-relaxed mb-6">

          For inventory discrepancies, warehouse operational issues, or ERP access concerns, contact your system administrator or operational support team.

        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="bg-gray-50 rounded-2xl p-5">

            <p className="text-sm text-gray-500 mb-2">

              ERP Platform

            </p>

            <h3 className="font-bold text-gray-900">

              ZICO STOCK

            </h3>

          </div>

          <div className="bg-gray-50 rounded-2xl p-5">

            <p className="text-sm text-gray-500 mb-2">

              Support Status

            </p>

            <h3 className="font-bold text-green-700">

              Operational

            </h3>

          </div>

          <div className="bg-gray-50 rounded-2xl p-5">

            <p className="text-sm text-gray-500 mb-2">

              System Environment

            </p>

            <h3 className="font-bold text-gray-900">

              Production Ready

            </h3>

          </div>

        </div>

      </div>

    </div>

  );

}

export default Help;