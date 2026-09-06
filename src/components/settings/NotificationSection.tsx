"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { NotificationHelpPanel } from "@/components/settings/NotificationHelpPanel";
import { PreDayWorkNotifyHint } from "@/components/settings/PreDayWorkNotifyHint";
import { useNotifications } from "@/hooks/useNotifications";
import type { UpdateNotificationSettingsInput } from "@/types/local";

function SettingRow({
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
}: {
  label: string;
  description?: React.ReactNode;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5">
      <div className="min-w-0">
        <p className="text-sm font-medium leading-tight">{label}</p>
        {description && (
          <div className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{description}</div>
        )}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </div>
  );
}

export function NotificationSection() {
  const { settings, isLoading, updateSettings } = useNotifications();
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function saveChanges(input: UpdateNotificationSettingsInput) {
    setIsSaving(true);
    setMessage(null);

    try {
      await updateSettings(input);
      setMessage("알림 설정이 저장되었습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading || !settings) {
    return (
      <section className="app-card p-6">
        <p className="text-sm text-muted-foreground">알림 설정 불러오는 중...</p>
      </section>
    );
  }

  return (
    <section className="app-card p-6">
      <h2 className="mb-3 text-xs font-semibold text-muted-foreground">근무 · 수면 알림</h2>

      <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
        위 Push 알림을 켠 뒤 받을 알림 종류를 선택하세요.
      </p>

      <div className="space-y-2">
        <SettingRow
          label="오늘 근무 알림"
          description="시작 1시간 전"
          checked={settings.todayEnabled}
          disabled={isSaving}
          onCheckedChange={(checked) => void saveChanges({ todayEnabled: checked })}
        />

        <SettingRow
          label="내일 근무 알림"
          description={
            <span className="inline-flex items-center gap-1">
              전날 저녁
              <PreDayWorkNotifyHint />
            </span>
          }
          checked={settings.tomorrowEnabled}
          disabled={isSaving}
          onCheckedChange={(checked) => void saveChanges({ tomorrowEnabled: checked })}
        />

        <SettingRow
          label="수면 알림"
          description="취침 1시간 전"
          checked={settings.sleepEnabled}
          disabled={isSaving}
          onCheckedChange={(checked) => void saveChanges({ sleepEnabled: checked })}
        />
      </div>

      <div className="mt-2.5">
        <NotificationHelpPanel settings={settings} />
      </div>

      {message && (
        <p className="mt-3 text-[11px] text-muted-foreground" role="status">
          {message}
        </p>
      )}
    </section>
  );
}
