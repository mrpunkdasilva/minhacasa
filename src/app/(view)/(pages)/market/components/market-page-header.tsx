import type { ReactNode } from "react";

interface MarketPageHeaderProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export default function MarketPageHeader({
  title,
  description,
  action,
}: MarketPageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tighter text-white">
          {title}
        </h1>
        <p className="text-zinc-500 text-sm sm:text-base mt-1 sm:mt-2">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}
