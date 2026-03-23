import * as React from "react"
import { cn } from "@/lib/utils"
import Icon from "@/components/AppIcon"

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options?: Array<{ value: string; label: string }>;
}

function Select({ className, options = [], children, ...props }: SelectProps) {
  return (
    <div className="relative">
      <select
        className={cn(
          "h-10 w-full appearance-none rounded-lg border border-border bg-background px-3 py-2 text-sm pr-10",
          "transition-colors outline-none",
          "focus:border-ring focus:ring-2 focus:ring-ring/20",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        {options.length > 0
          ? options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))
          : children}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <Icon name="ChevronDown" size={16} className="text-muted-foreground" />
      </div>
    </div>
  )
}

export default Select;
