import {
  ShieldX,
  ArrowLeft
} from "lucide-react";

import {
  Link
} from "react-router-dom";

function Unauthorized() {

  return (

    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">

      <div className="bg-white border border-gray-200 shadow-xl rounded-3xl p-12 text-center max-w-xl w-full">

        {/* ICON */}

        <div className="w-24 h-24 rounded-3xl bg-red-100 flex items-center justify-center mx-auto mb-6">

          <ShieldX
            size={42}
            className="text-red-700"
          />

        </div>

        {/* TITLE */}

        <h1 className="text-4xl font-black text-gray-900 mb-4">

          Access Denied

        </h1>

        {/* DESCRIPTION */}

        <p className="text-gray-500 mb-8">

          You do not have permission to access this ERP module.

        </p>

        {/* BUTTON */}

        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 transition text-white px-6 py-3 rounded-2xl font-semibold"
        >

          <ArrowLeft size={18} />

          Return to Dashboard

        </Link>

      </div>

    </div>

  );

}

export default Unauthorized;
