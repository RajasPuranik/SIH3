"use client";

import React from "react";
import { ThemeProvider } from "next-themes";
import { I18nProvider } from "@/lib/i18n";
import { CommandPalette } from "@/components/features/command-palette";
import { AssistantPanel } from "@/components/features/assistant-panel";
import { OnboardingTour } from "@/components/features/onboarding-tour";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <I18nProvider>
        {children}
        <CommandPalette />
        <AssistantPanel />
        <OnboardingTour />
      </I18nProvider>
    </ThemeProvider>
  );
}
