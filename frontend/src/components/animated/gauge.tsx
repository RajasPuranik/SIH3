"use client"

import React, { useEffect, useState } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { useReducedMotion } from '@/lib/motion'

export interface GaugeProps {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  label?: string
  color?: string
  showValue?: boolean
  formatValue?: (val: number) => string
}

export function Gauge({ 
  value, 
  max = 100, 
  size = 200, 
  strokeWidth = 16,
  label,
  color,
  showValue = true,
  formatValue = (v) => v.toString()
}: GaugeProps) {
  const reducedMotion = useReducedMotion()
  const controls = useAnimation()
  
  const center = size / 2
  const radius = center - strokeWidth / 2
  const circumference = Math.PI * radius // Semicircle
  
  const percentage = Math.min(Math.max(value / max, 0), 1)
  const strokeDashoffset = circumference - percentage * circumference
  
  const getColor = (pct: number) => {
    if (pct < 0.4) return '#10B981' // Success
    if (pct < 0.75) return '#F59E0B' // Warning
    return '#E11D48' // Danger
  }
  
  const activeColor = color || getColor(percentage)
  
  useEffect(() => {
    if (reducedMotion) {
      controls.set({ strokeDashoffset })
    } else {
      controls.start({
        strokeDashoffset,
        transition: { type: 'spring', stiffness: 50, damping: 15, duration: 1.5 }
      })
    }
  }, [percentage, reducedMotion, controls, strokeDashoffset])

  return (
    <div className="relative flex flex-col items-center" style={{ width: size, height: size / 2 + 20 }}>
      <svg width={size} height={size / 2} className="overflow-visible">
        {/* Background track */}
        <path
          d={`M ${strokeWidth/2} ${size/2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth/2} ${size/2}`}
          fill="none"
          stroke="currentColor"
          className="text-muted opacity-20"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Animated value track */}
        <motion.path
          d={`M ${strokeWidth/2} ${size/2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth/2} ${size/2}`}
          fill="none"
          stroke={activeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={controls}
        />
      </svg>
      <div className="absolute bottom-0 flex flex-col items-center">
        <span className="text-3xl font-bold font-mono" style={{ color }}>
          {formatValue(value)}
        </span>
        {label && <span className="text-sm text-muted-foreground">{label}</span>}
      </div>
    </div>
  )
}
