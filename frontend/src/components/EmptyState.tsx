import {
  ReactNode
} from "react";

import {
  Inbox
} from "lucide-react";

interface Props {

  title: string;

  description: string;

  action?: ReactNode;

}

function EmptyState({
  title,
  description,
  action
}: Props) {

  return (

    <div className="py-14 text-center">

      {/* ICON */}

      <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-5">

        <Inbox
          size={36}
          className="text-gray-500"
        />

      </div>

      {/* TITLE */}

      <h3 className="text-2xl font-bold text-gray-900 mb-3">

        {title}

      </h3>

      {/* DESCRIPTION */}

      <p className="text-gray-500 max-w-md mx-auto mb-6">

        {description}

      </p>

      {/* ACTION */}

      {action}

    </div>

  );

}

export default EmptyState;