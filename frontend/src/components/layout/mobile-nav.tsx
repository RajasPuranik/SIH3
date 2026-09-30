"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Home, LineChart, Package, Search, Menu } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useTranslation } from '@/lib/i18n'

const TABS = [
  { href: '/', icon: Home, labelKey: 'nav.home' },
  { href: '/analyze', icon: LineChart, labelKey: 'nav.analyze' },
  { href: '/catalog', icon: Package, labelKey: 'nav.catalog' },
  { href: '/trace', icon: Search, labelKey: 'nav.trace' },
  { href: '/more', icon: Menu, labelKey: 'nav.more' },
]

export function MobileNav() {
  const pathname = usePathname()
  const { t } = useTranslation()

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-lg border-t pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {TABS.map((tab) => {
          const isActive = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href))
          
          return (
            <Link 
              key={tab.href} 
              href={tab.href}
              className="relative flex flex-col items-center justify-center w-full h-full min-w-[44px] min-h-[44px]"
            >
              <div className={cn(
                "flex flex-col items-center gap-1 transition-colors z-10",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                <tab.icon className={cn("h-5 w-5", isActive && "fill-primary/20")} />
                <span className="text-[10px] font-medium">{t(tab.labelKey)}</span>
              </div>
              
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-active"
                  className="absolute top-0 w-12 h-1 bg-primary rounded-b-full"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
