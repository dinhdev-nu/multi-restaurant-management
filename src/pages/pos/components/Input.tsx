import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm",
        "transition-colors outline-none",
        "focus:border-ring focus:ring-2 focus:ring-ring/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "placeholder:text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

export default Input;
