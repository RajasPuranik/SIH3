"use client"

import React, { useEffect, useState } from 'react'
import { animate, motion, useMotionValue, useTransform } from 'framer-motion'
import { useReducedMotion } from '@/lib/motion'
import { cn } from '@/lib/utils'

interface AnimatedNumberProps {
  value: number
  format?: (value: number) => string
  className?: string
  duration?: number
}

export function AnimatedNumber({ 
  value, 
  format = (v) => v.toFixed(0),
  className,
  duration = 1 
}: AnimatedNumberProps) {
  const reducedMotion = useReducedMotion()
  const [displayValue, setDisplayValue] = useState(format(value))
  const motionValue = useMotionValue(value)
  
  useEffect(() => {
    if (reducedMotion) {
      setDisplayValue(format(value))
      return
    }
    
    const controls = animate(motionValue, value, {
      duration,
      ease: 'easeOut',
      onUpdate: (latest) => {
        setDisplayValue(format(latest))
      }
    })
    
    return controls.stop
  }, [value, format, duration, reducedMotion, motionValue])

  return (
    <motion.span className={cn("font-mono tabular-nums", className)}>
      {displayValue}
    </motion.span>
  )
}
