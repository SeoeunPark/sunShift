"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PwaInstallGuide } from "@/components/pwa/PwaInstallGuide";
import { PwaNotificationGuide } from "@/components/pwa/PwaNotificationGuide";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import { getInstallInstructions, isAndroidDevice, isIosDevice } from "@/lib/pwa/install";
import { cn } from "@/lib/utils";

export function PwaInstallSection() {
  const { isInstalled, canInstall, isInstalling, install } = usePwaInstall();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const statusLabel = isInstalled ? "추가됨" : "미추가";
  const installHint = getInstallInstructions();

  async function handleInstall() {
    setMessage(null);
    const outcome = await install();
    if (outcome === "accepted") {
      setMessage("홈 화면에 추가되었습니다.");
    } else if (outcome === "dismissed") {
      setMessage("추가가 취소되었습니다.");
    } else if (installHint) {
      setMessage(installHint);
    }
  }

  return (
    <section className="app-card overflow-hidden">
      <button
        type="button"
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/30"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">홈 화면에 추가</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            앱처럼 열기 · Push 알림
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
            isInstalled
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground",
          )}
        >
          {statusLabel}
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="space-y-3 border-t border-border/50 px-4 py-3.5">
          {!isInstalled && (
            <div className="space-y-2">
              {canInstall ? (
                <Button
                  className="w-full"
                  size="sm"
                  onClick={() => void handleInstall()}
                  disabled={isInstalling}
                >
                  {isInstalling ? "추가 중..." : "홈 화면에 추가"}
                </Button>
              ) : (
                <p className="text-xs text-muted-foreground">{installHint}</p>
              )}
            </div>
          )}

          <PwaInstallGuide compact />

          <PwaNotificationGuide compact />

          {(isIosDevice() || isAndroidDevice()) && (
            <p className="text-[10px] leading-relaxed text-muted-foreground">
              {isIosDevice()
                ? "iPhone 알림은 잠금 화면·배너로 옵니다. Safari 탭이 아닌 홈 화면 앱에서만 가능합니다."
                : "Android는 Chrome → 홈 화면 추가 후 알림 센터로 받을 수 있습니다."}
            </p>
          )}

          {message && (
            <p className="text-xs text-muted-foreground" role="status">
              {message}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
