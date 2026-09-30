"use client";

import * as React from "react"
import { motion, HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"
import { useReducedMotion } from "@/lib/motion"
import { cva, type VariantProps } from "class-variance-authority"

const cardVariants = cva(
  "rounded-2xl border bg-card text-card-foreground shadow-sm",
  {
    variants: {
      variant: {
        default: "",
        elevated: "shadow-md hover:shadow-lg transition-shadow duration-300",
        glass: "glass",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface CardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {
  hoverLift?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, hoverLift = false, ...props }, ref) => {
    const reducedMotion = useReducedMotion()
    
    if (hoverLift && !reducedMotion) {
      return (
        <motion.div
          whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(15, 81, 50, 0.1), 0 8px 10px -6px rgba(15, 81, 50, 0.1)" }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className={cn(cardVariants({ variant }), className)}
          {...(props as unknown as HTMLMotionProps<"div">)}
        />
      )
    }

    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant }), className)}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
