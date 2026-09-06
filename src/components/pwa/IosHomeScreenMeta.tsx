"use client";

import { useLayoutEffect } from "react";
import { APP_DISPLAY_NAME, APP_IOS_HOME_SCREEN_NAME } from "@/lib/brand/appName";

function isIosSafari(): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }

  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

/** Keep iOS Add to Home Screen name in sync with branding meta tags. */
export function IosHomeScreenMeta() {
  useLayoutEffect(() => {
    if (!isIosSafari()) {
      return;
    }

    document.title = APP_IOS_HOME_SCREEN_NAME;

    let meta = document.querySelector<HTMLMetaElement>('meta[name="apple-mobile-web-app-title"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "apple-mobile-web-app-title";
      document.head.appendChild(meta);
    }

    meta.content = APP_IOS_HOME_SCREEN_NAME;

    let applicationName = document.querySelector<HTMLMetaElement>('meta[name="application-name"]');
    if (!applicationName) {
      applicationName = document.createElement("meta");
      applicationName.name = "application-name";
      document.head.appendChild(applicationName);
    }

    applicationName.content = APP_DISPLAY_NAME;
  }, []);

  return null;
}
