import {
  AlertTriangle
} from "lucide-react";

interface Props {

  message: string;

}

function ErrorMessage({
  message
}: Props) {

  return (

    <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-4">

      <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">

        <AlertTriangle
          size={22}
          className="text-red-600"
        />

      </div>

      <div>

        <h3 className="font-bold text-red-700 mb-1">

          Something went wrong

        </h3>

        <p className="text-red-600 text-sm">

          {message}

        </p>

      </div>

    </div>

  );

}

export default ErrorMessage;
