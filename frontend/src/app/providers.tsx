"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { ThemeProvider } from "next-themes";
import { I18nProvider } from "@/lib/i18n";
import { CommandPalette } from "@/components/features/command-palette";
import { AssistantPanel } from "@/components/features/assistant-panel";
import { OnboardingTour } from "@/components/features/onboarding-tour";

const publicRoutes = ['/', '/login', '/signup', '/about'];

function AuthGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state: any) => state.isAuthenticated);
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const isPublic = publicRoutes.includes(pathname || '') || 
                     pathname?.startsWith('/report/') || 
                     pathname?.startsWith('/trace/');
    
    if (!isAuthenticated && !isPublic) {
      router.push('/login');
    } else if (isAuthenticated && (pathname === '/login' || pathname === '/signup')) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, pathname, router, mounted]);

  if (!mounted) return <div className="min-h-screen bg-stone-50" />;
  
  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <I18nProvider>
        <AuthGuard>
          {children}
        </AuthGuard>
        <CommandPalette />
        <AssistantPanel />
        <OnboardingTour />
      </I18nProvider>
    </ThemeProvider>
  );
}
