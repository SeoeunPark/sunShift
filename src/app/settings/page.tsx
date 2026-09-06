"use client";

import { SettingsUsageGuide } from "@/components/settings/SettingsUsageGuide";
import { PwaInstallSection } from "@/components/pwa/PwaInstallSection";
import { NotificationSection } from "@/components/settings/NotificationSection";
import { PushNotificationSection } from "@/components/settings/PushNotificationSection";
import { AccountSection } from "@/components/settings/AccountSection";
import { PageHeader } from "@/components/ui/PageHeader";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-5 py-4">
      <PageHeader title="설정" description="알림과 계정을 관리합니다." />
      <SettingsUsageGuide />
      <PwaInstallSection />
      <PushNotificationSection />
      <NotificationSection />
      <AccountSection />
      <footer className="text-center text-[11px] leading-relaxed text-muted-foreground/80">
        <p>© {new Date().getFullYear()} 박서은</p>
        <a
          href="mailto:seoeunpark.03@gmail.com"
          className="hover:text-foreground"
        >
          seoeunpark.03@gmail.com
        </a>
      </footer>
    </div>
  );
}
