import {
  Construction
} from "lucide-react";

interface Props {

  title: string;

  description: string;

}

function ModulePlaceholder({
  title,
  description
}: Props) {

  return (

    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-12 text-center">

      <div className="w-24 h-24 rounded-3xl bg-yellow-100 flex items-center justify-center mx-auto mb-6">

        <Construction
          size={42}
          className="text-yellow-700"
        />

      </div>

      <h2 className="text-3xl font-bold text-gray-900 mb-3">

        {title}

      </h2>

      <p className="text-gray-500 max-w-xl mx-auto">

        {description}

      </p>

      <div className="mt-8 inline-flex items-center px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium">

        Module under development

      </div>

    </div>

  );

}

export default ModulePlaceholder;
