"use client";

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion, HTMLMotionProps } from "framer-motion"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { useReducedMotion } from "@/lib/motion"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3 min-h-[44px] min-w-[44px]", // Minimum touch target 44px
        lg: "h-11 rounded-xl px-8 min-h-[44px]",
        icon: "h-10 w-10 min-h-[44px] min-w-[44px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

// Omit the transition prop from framer motion types to avoid conflicts
type MotionButtonProps = Omit<HTMLMotionProps<"button">, keyof ButtonProps | "children"> & ButtonProps

const Button = React.forwardRef<HTMLButtonElement, MotionButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, ...props }, ref) => {
    const reducedMotion = useReducedMotion()
    const Comp = asChild ? Slot : "button"
    
    if (asChild) {
      return (
        <Comp
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref as React.Ref<HTMLElement>}
          {...(props as any)}
        >
          {children}
        </Comp>
      )
    }

    return (
      <motion.button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        whileTap={reducedMotion || props.disabled || loading ? {} : { scale: 0.98 }}
        disabled={props.disabled || loading}
        {...(props as any)}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </motion.button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
