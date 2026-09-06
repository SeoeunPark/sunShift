export function isBrowserOnline(): boolean {
  if (typeof navigator === "undefined") {
    return true;
  }
  return navigator.onLine;
}

export function subscribeOnlineStatus(onOnline: () => void, onOffline?: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("online", onOnline);
  if (onOffline) {
    window.addEventListener("offline", onOffline);
  }

  return () => {
    window.removeEventListener("online", onOnline);
    if (onOffline) {
      window.removeEventListener("offline", onOffline);
    }
  };
}
