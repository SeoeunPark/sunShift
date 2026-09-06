"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LoadingCard } from "@/components/ui/LoadingCard";
import { useDbReady } from "@/components/layout/DbProvider";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";

const EXCLUDED_PREFIXES = ["/onboarding", "/auth", "/offline"];

function isExcludedPath(pathname: string): boolean {
  return EXCLUDED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function OnboardingGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const dbReady = useDbReady();
  const { isCompleted, isLoading, reload } = useOnboardingStatus();
  const wasOnOnboardingRef = useRef(false);
  const awaitingOnboardingReloadRef = useRef(false);

  useEffect(() => {
    if (dbReady) {
      reload();
    }
  }, [dbReady, reload]);

  useEffect(() => {
    const onOnboarding = pathname === "/onboarding" || pathname.startsWith("/onboarding/");
    const leftOnboarding = wasOnOnboardingRef.current && !onOnboarding;

    wasOnOnboardingRef.current = onOnboarding;

    if (leftOnboarding && dbReady) {
      awaitingOnboardingReloadRef.current = true;
      reload();
    }
  }, [dbReady, pathname, reload]);

  useEffect(() => {
    if (!dbReady) {
      return;
    }

    if (awaitingOnboardingReloadRef.current) {
      if (isLoading || isCompleted === null) {
        return;
      }
      awaitingOnboardingReloadRef.current = false;
    } else if (isLoading || isCompleted === null) {
      return;
    }

    if (isExcludedPath(pathname)) {
      return;
    }

    if (!isCompleted) {
      router.replace("/onboarding");
    }
  }, [dbReady, isCompleted, isLoading, pathname, router]);

  if (isExcludedPath(pathname)) {
    return <>{children}</>;
  }

  if (!dbReady || isLoading || isCompleted === null || !isCompleted) {
    return (
      <div className="page-enter flex flex-col gap-4 py-6">
        <LoadingCard lines={3} />
      </div>
    );
  }

  return <div className="page-enter">{children}</div>;
}
