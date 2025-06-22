import { type ReactNode } from "react";

interface TooltipProps {
  children: ReactNode; // The element to hover over (the trigger)
  tip: string;       // The text to display in the tooltip
}

export function Tooltip({ children, tip }: TooltipProps) {
  return (
    <div className="relative group flex items-center">

      { children }

      <div
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                   w-max max-w-xs px-2 py-1 rounded-md shadow-lg
                   text-xs font-medium
                   bg-[var(--muted)] text-[var(--foreground)] border border-[var(--border)]
                   invisible opacity-0 group-hover:visible group-hover:opacity-100
                   transition-opacity duration-200 whitespace-pre-line"
      >
        { tip }
      </div>
    </div>
  );
}