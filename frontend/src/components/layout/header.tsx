"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Leaf, Menu, X, Sun, Moon, Bell, User as UserIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useAuthStore, useSettingsStore } from '@/lib/store'
import { useTranslation } from '@/lib/i18n'
import { cn } from '@/lib/utils'

export function Header() {
  const { t, language, setLanguage } = useTranslation()
  const { theme, setTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  
  const mode = useSettingsStore((s) => s.mode)
  const setMode = useSettingsStore((s) => s.setMode)
  const setSettingsLanguage = useSettingsStore((s) => s.setLanguage)
  
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')
  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'hi' : 'en';
    setLanguage(newLang);
    setSettingsLanguage(newLang);
  }

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Leaf className="h-5 w-5" />
            </div>
            <span className="hidden font-serif text-xl font-bold sm:inline-block">
              PackLabs
            </span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-6">
          <div className="flex items-center gap-2 mr-4 bg-muted p-1 rounded-full">
            <span className={cn("text-xs font-medium px-2 py-1 rounded-full transition-colors", mode === 'simple' && "bg-background shadow-sm")}>Simple</span>
            <Switch 
              checked={mode === 'expert'} 
              onCheckedChange={(c) => setMode(c ? 'expert' : 'simple')} 
            />
            <span className={cn("text-xs font-medium px-2 py-1 rounded-full transition-colors", mode === 'expert' && "bg-background shadow-sm")}>Expert</span>
          </div>

          <Button variant="ghost" size="icon" onClick={toggleLanguage} title={`Switch to ${language === 'en' ? 'Hindi' : 'English'}`}>
            <span className="font-semibold">{language === 'en' ? 'हिं' : 'EN'}</span>
          </Button>
          
          <Button variant="ghost" size="icon" onClick={toggleTheme} title="Toggle theme">
             {mounted ? (theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />) : <Moon className="h-5 w-5 opacity-0" />}
          </Button>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-card">
                 <UserIcon className="h-4 w-4 text-muted-foreground" />
                 <span className="text-sm font-medium">{(user as any)?.full_name || (user as any)?.name || 'User'}</span>
              </div>
              <Button variant="outline" size="sm" onClick={logout}>Logout</Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">{t('btn.login')}</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">{t('btn.signup')}</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex lg:hidden items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
             {mounted ? (theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />) : <Moon className="h-5 w-5 opacity-0" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden border-b bg-background overflow-hidden"
          >
            <div className="container py-4 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b pb-4">
                <span className="font-medium">Mode</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Simple</span>
                  <Switch checked={mode === 'expert'} onCheckedChange={(c) => setMode(c ? 'expert' : 'simple')} />
                  <span className="text-sm">Expert</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between border-b pb-4">
                <span className="font-medium">Language</span>
                <Button variant="outline" size="sm" onClick={toggleLanguage}>
                  {language === 'en' ? 'Switch to Hindi (हिं)' : 'Switch to English (EN)'}
                </Button>
              </div>

              {!isAuthenticated ? (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Button variant="outline" asChild><Link href="/login">{t('btn.login')}</Link></Button>
                  <Button asChild><Link href="/signup">{t('btn.signup')}</Link></Button>
                </div>
              ) : (
                <Button variant="outline" onClick={logout}>Logout</Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
