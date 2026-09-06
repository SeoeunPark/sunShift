export interface ServiceWorkerRegistrationResult {
  registration: ServiceWorkerRegistration;
  waitingWorker: ServiceWorker | null;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistrationResult | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });

    return {
      registration,
      waitingWorker: registration.waiting,
    };
  } catch (error) {
    console.error("Service worker registration failed:", error);
    return null;
  }
}

export function isPwaInstalled(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator &&
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export async function activateWaitingServiceWorker(): Promise<void> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }

  const registration = await navigator.serviceWorker.getRegistration();

  if (!registration?.waiting) {
    window.location.reload();
    return;
  }

  navigator.serviceWorker.addEventListener(
    "controllerchange",
    () => {
      window.location.reload();
    },
    { once: true },
  );

  registration.waiting.postMessage({ type: "SKIP_WAITING" });
}
