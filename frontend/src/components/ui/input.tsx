import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, icon, iconPosition = 'left', ...props }, ref) => {
    return (
      <div className="relative w-full">
        {icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-shadow",
            error && "border-destructive focus-visible:ring-destructive",
            icon && iconPosition === 'left' && "pl-10",
            icon && iconPosition === 'right' && "pr-10",
            className
          )}
          ref={ref}
          {...props}
        />
        {icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-muted-foreground">
            {icon}
          </div>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
