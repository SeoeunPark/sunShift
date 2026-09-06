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
    <div className="flex items-start justify-between gap-4 rounded-xl border p-4">
      <div>
        <p className="font-medium">{label}</p>
        {description && (
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">{description}</p>
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
      <h2 className="mb-2 text-sm font-medium text-muted-foreground">근무 · 수면 알림</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        받을 알림 종류를 선택합니다. Push 알림이 켜져 있어야 실제로 전송됩니다.
      </p>

      <div className="space-y-3">
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
            <>
              근무 전날 알림
              <PreDayWorkNotifyHint />
            </>
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

      <div className="mt-3">
        <NotificationHelpPanel settings={settings} />
      </div>

      {message && (
        <p className="mt-4 text-sm text-muted-foreground" role="status">
          {message}
        </p>
      )}
    </section>
  );
}
