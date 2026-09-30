"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { motion, AnimatePresence } from "framer-motion"

import { cn } from "@/lib/utils"

export interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  showValue?: boolean;
  formatValue?: (val: number) => string;
  gradient?: boolean;
  tickMarks?: boolean;
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, showValue = true, formatValue = (v) => v.toString(), gradient = false, tickMarks = false, ...props }, ref) => {
  const [value, setValue] = React.useState(props.defaultValue || props.value || [0]);
  const [isHovered, setIsHovered] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);

  const handleValueChange = (newVal: number[]) => {
    setValue(newVal);
    props.onValueChange?.(newVal);
  };

  const pct = props.max ? (value[0] / props.max) * 100 : 0;
  
  // Dynamic color based on value if gradient is true
  const trackColor = gradient 
    ? pct < 33 ? 'bg-success' : pct < 66 ? 'bg-warning' : 'bg-danger'
    : 'bg-primary';

  return (
    <div className="relative w-full py-4">
      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          className
        )}
        onValueChange={handleValueChange}
        onPointerDown={() => setIsDragging(true)}
        onPointerUp={() => setIsDragging(false)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
          <SliderPrimitive.Range className={cn("absolute h-full transition-colors", trackColor)} />
        </SliderPrimitive.Track>
        
        {tickMarks && props.max && props.step && (
          <div className="absolute top-1/2 left-0 w-full h-full flex justify-between px-2 -translate-y-1/2 pointer-events-none">
             {Array.from({ length: (props.max / props.step) + 1 }).map((_, i) => (
                <div key={i} className="w-[2px] h-2 bg-background/50 rounded-full" />
             ))}
          </div>
        )}
        
        <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-110 active:scale-95 duration-200">
          <AnimatePresence>
            {(showValue && (isHovered || isDragging)) && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: -30, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-md whitespace-nowrap pointer-events-none z-10"
              >
                {formatValue(value[0])}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-popover rotate-45" />
              </motion.div>
            )}
          </AnimatePresence>
        </SliderPrimitive.Thumb>
      </SliderPrimitive.Root>
    </div>
  )
})
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
