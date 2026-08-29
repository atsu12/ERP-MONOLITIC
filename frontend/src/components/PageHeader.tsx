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
    <div className="mb-7 flex items-start justify-between gap-6">
      <div className="min-w-0">
        <div className="mb-1.5 flex items-center gap-3">
          {icon && (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#3155d9]">
              {icon}
            </span>
          )}

          <h1 className="text-[24px] font-extrabold tracking-[-0.03em] text-[#111a38]">
            {title}
          </h1>
        </div>

        {description && (
          <p className="text-[13px] font-medium leading-5 text-slate-500">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex shrink-0 items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}

export default PageHeader;