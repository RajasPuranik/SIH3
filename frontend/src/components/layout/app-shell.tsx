"use client"

import React, { ReactNode } from 'react'
import { Header } from './header'
import { Sidebar } from './sidebar'
import { MobileNav } from './mobile-nav'
import { ToastProvider } from '@/components/ui/toast'
import { useReducedMotion } from '@/lib/motion'
import { usePathname } from 'next/navigation'

export default function AppShell({ children }: { children: ReactNode }) {
  // Use the hook to initialize the reduced motion listener early
  useReducedMotion()
  
  const pathname = usePathname()
  const isAuthPage = pathname === '/login' || pathname === '/signup'

  if (isAuthPage) {
    return (
      <ToastProvider>
        <div className="flex min-h-[100dvh] flex-col bg-background">
          {children}
        </div>
      </ToastProvider>
    )
  }

  return (
    <ToastProvider>
      <div className="flex h-[100dvh] flex-col bg-background">
        <Header />
        
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          
          <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
            <div className="container max-w-7xl py-6 md:py-8 lg:py-10 mx-auto">
              {children}
            </div>
          </main>
        </div>
        
        <MobileNav />
      </div>
    </ToastProvider>
  )
}
