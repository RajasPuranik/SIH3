"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Home, LineChart, Package, Search, Settings, ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useTranslation } from '@/lib/i18n'
import { useUIStore } from '@/lib/store'
import { Button } from '@/components/ui/button'

const NAV_ITEMS = [
  { href: '/', icon: Home, labelKey: 'nav.home' },
  { href: '/analyze', icon: LineChart, labelKey: 'nav.analyze' },
  { href: '/catalog', icon: Package, labelKey: 'nav.catalog' },
  { href: '/trace', icon: Search, labelKey: 'nav.trace' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { t } = useTranslation()
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen)

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 240 : 80 }}
      className="hidden lg:flex flex-col border-r bg-card h-[calc(100vh-4rem)] sticky top-16 z-30 transition-all duration-300"
    >
      <div className="flex-1 py-6 px-3 flex flex-col gap-2 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          
          return (
            <Link key={item.href} href={item.href} className="relative block">
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl transition-colors hover:bg-accent hover:text-accent-foreground",
                  isActive ? "text-primary font-medium" : "text-muted-foreground",
                  !sidebarOpen && "justify-center px-0"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {sidebarOpen && <span>{t(item.labelKey)}</span>}
              </div>
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-0 h-full w-full rounded-xl bg-primary/10 pointer-events-none"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          )
        })}
      </div>

      <div className="p-3 border-t">
        <Link href="/settings" className="relative block mb-2">
          <div className={cn(
            "flex items-center gap-3 px-3 py-3 rounded-xl transition-colors hover:bg-accent hover:text-accent-foreground text-muted-foreground",
            !sidebarOpen && "justify-center px-0"
          )}>
            <Settings className="h-5 w-5 shrink-0" />
            {sidebarOpen && <span>Settings</span>}
          </div>
        </Link>

        <Button 
          variant="ghost" 
          className="w-full flex justify-center" 
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </Button>
      </div>
    </motion.aside>
  )
}
