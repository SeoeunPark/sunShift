import type { ReactNode } from "react";
import { OnboardingGate } from "@/components/onboarding/OnboardingGate";
import { AppLogo } from "@/components/layout/AppLogo";
import { OfflineBanner } from "@/components/pwa/OfflineBanner";
import { BOTTOM_NAV_RESERVE } from "@/lib/layout/viewport";
import { cn } from "@/lib/utils";
import { BottomNavigation } from "./BottomNavigation";
import { IosHomeScreenMeta } from "@/components/pwa/IosHomeScreenMeta";
import { ServiceWorkerProvider } from "./ServiceWorkerProvider";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <>
      <IosHomeScreenMeta />
      <ServiceWorkerProvider />
      <div className={cn("app-bg mx-auto flex min-h-dvh w-full max-w-lg flex-col", BOTTOM_NAV_RESERVE)}>
        <OfflineBanner />
        <header className="sticky top-0 z-40 shrink-0 border-b border-border/50 bg-background/75 px-4 py-2.5 backdrop-blur-xl supports-[backdrop-filter]:bg-background/65 pt-[max(0.5rem,env(safe-area-inset-top))]">
          <AppLogo />
        </header>
        <main className="flex flex-1 flex-col px-4">
          <OnboardingGate>{children}</OnboardingGate>
        </main>
        <BottomNavigation />
      </div>
    </>
  );
}
