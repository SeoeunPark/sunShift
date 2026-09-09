import { PushCatchUpProvider } from "@/components/pwa/PushCatchUpProvider";
import { WidgetSyncProvider } from "@/components/widget/WidgetSyncProvider";
import { AppShell } from "@/components/layout/AppShell";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { DbProvider } from "@/components/layout/DbProvider";
import { OnboardingStatusProvider } from "@/components/onboarding/OnboardingStatusProvider";
import { SyncProvider } from "@/components/layout/SyncProvider";
import type { Metadata, Viewport } from "next";
import { APP_DISPLAY_NAME, APP_IOS_HOME_SCREEN_NAME } from "@/lib/brand/appName";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: APP_IOS_HOME_SCREEN_NAME,
  applicationName: APP_DISPLAY_NAME,
  description: "4조 교대근무 관리 서비스",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_IOS_HOME_SCREEN_NAME,
  },
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f6fa" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1c24" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${notoSansKr.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full bg-background text-foreground font-sans"
        suppressHydrationWarning
      >
        <AuthProvider>
          <DbProvider>
            <OnboardingStatusProvider>
              <SyncProvider>
                <AppShell>
                  <PushCatchUpProvider>
                    <WidgetSyncProvider>{children}</WidgetSyncProvider>
                  </PushCatchUpProvider>
                </AppShell>
              </SyncProvider>
            </OnboardingStatusProvider>
          </DbProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
