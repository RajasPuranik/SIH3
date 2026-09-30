"use client"

import React, { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { useReducedMotion, staggerContainer, fadeInUp, fadeIn } from '@/lib/motion'

interface RevealOnScrollProps {
  children: ReactNode
  className?: string
  stagger?: boolean
  threshold?: number
  delay?: number
}

export function RevealOnScroll({ 
  children, 
  className,
  stagger = false,
  threshold = 0.1,
  delay = 0,
}: RevealOnScrollProps) {
  const reducedMotion = useReducedMotion()
  
  if (reducedMotion) {
    return <div className={className}>{children}</div>
  }
  
  if (stagger) {
    return (
      <motion.div
        className={className}
        variants={staggerContainer(0.1)}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: threshold }}
      >
        {React.Children.map(children, (child) => (
          <motion.div variants={fadeInUp}>
            {child}
          </motion.div>
        ))}
      </motion.div>
    )
  }

  return (
    <motion.div
      className={className}
      variants={fadeInUp}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, amount: threshold }}
    >
      {children}
    </motion.div>
  )
}
