import {
  Loader2
} from "lucide-react";

interface Props {

  text?: string;

}

function PageLoader({
  text = "Loading..."
}: Props) {

  return (

    <div className="flex flex-col items-center justify-center py-20">

      <Loader2
        size={42}
        className="animate-spin text-gray-700"
      />

      <p className="mt-5 text-gray-500 font-medium">

        {text}

      </p>

    </div>

  );

}

export default PageLoader;
