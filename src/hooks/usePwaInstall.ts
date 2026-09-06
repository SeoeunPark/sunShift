"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getInstallInstructions,
  isBeforeInstallPromptEvent,
  type BeforeInstallPromptEvent,
} from "@/lib/pwa/install";
import { isPwaInstalled } from "@/lib/pwa/registerServiceWorker";

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(() => isPwaInstalled());
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      if (isBeforeInstallPromptEvent(event)) {
        setDeferredPrompt(event);
      }
    }

    function handleAppInstalled() {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const canInstall = Boolean(deferredPrompt) && !isInstalled;
  const instructions = getInstallInstructions();

  const install = useCallback(async () => {
    if (!deferredPrompt) {
      return "unavailable" as const;
    }

    setIsInstalling(true);

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
      return choice.outcome;
    } finally {
      setIsInstalling(false);
    }
  }, [deferredPrompt]);

  return {
    isInstalled,
    canInstall,
    isInstalling,
    instructions,
    install,
  };
}
