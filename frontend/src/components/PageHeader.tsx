import { ReactNode } from "react";

interface Props {
  icon?: ReactNode;

  title: string;

  description?: string;

  actions?: ReactNode;
}

function PageHeader({
  icon,
  title,
  description,
  actions,
}: Props) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          {icon}

          <h1 className="erp-page-title">
            {title}
          </h1>
        </div>

        {description && (
          <p className="erp-page-description">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div>
          {actions}
        </div>
      )}
    </div>
  );
}

export default PageHeader;