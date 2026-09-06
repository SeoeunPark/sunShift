"use client";

import { useEffect, useState } from "react";
import {
  activateWaitingServiceWorker,
  registerServiceWorker,
} from "@/lib/pwa/registerServiceWorker";
import { PwaUpdateBanner } from "@/components/pwa/PwaUpdateBanner";

export function ServiceWorkerProvider() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    let registration: ServiceWorkerRegistration | null = null;

    async function setup() {
      const result = await registerServiceWorker();
      if (!result) {
        return;
      }

      registration = result.registration;

      if (result.waitingWorker) {
        setUpdateAvailable(true);
      }

      registration.addEventListener("updatefound", () => {
        const installingWorker = registration?.installing;
        if (!installingWorker) {
          return;
        }

        installingWorker.addEventListener("statechange", () => {
          if (
            installingWorker.state === "installed" &&
            navigator.serviceWorker.controller &&
            registration?.waiting
          ) {
            setUpdateAvailable(true);
          }
        });
      });
    }

    void setup();

    return () => {
      registration = null;
    };
  }, []);

  function handleReload() {
    void activateWaitingServiceWorker();
  }

  return updateAvailable ? <PwaUpdateBanner onReload={handleReload} /> : null;
}
