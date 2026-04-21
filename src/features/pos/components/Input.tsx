import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.ComponentProps<"input"> {
  label?: React.ReactNode
  description?: React.ReactNode
  error?: React.ReactNode
  wrapperClassName?: string
}

function Input({
  className,
  type,
  id,
  label,
  description,
  error,
  required,
  wrapperClassName,
  ...props
}: InputProps) {
  const generatedId = React.useId()
  const inputId = id ?? generatedId

  const inputElement = (
    <input
      id={inputId}
      type={type}
      required={required}
      aria-invalid={Boolean(error)}
      className={cn(
        "h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm",
        "transition-colors outline-none",
        "focus:border-ring focus:ring-2 focus:ring-ring/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "placeholder:text-muted-foreground",
        error && "border-destructive focus:border-destructive focus:ring-destructive/20",
        className
      )}
      {...props}
    />
  )

  if (!label && !description && !error) {
    return inputElement
  }

  return (
    <div className={cn("space-y-2", wrapperClassName)}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="ml-1 text-destructive">*</span>}
        </label>
      )}

      {inputElement}

      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : (
        description && <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  )
}

export default Input;
