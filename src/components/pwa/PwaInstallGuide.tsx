"use client";

import {
  ANDROID_HOME_SCREEN_STEPS,
  getAndroidInstallNote,
  getIosPushRequirementNote,
  IOS_HOME_SCREEN_STEPS,
  isAndroidDevice,
  isIosDevice,
} from "@/lib/pwa/notificationSetupGuide";
import { cn } from "@/lib/utils";

function StepList({
  steps,
  compact,
}: {
  steps: readonly string[];
  compact: boolean;
}) {
  return (
    <ol
      className={cn(
        "list-decimal space-y-1 pl-4 text-muted-foreground",
        compact ? "text-[11px] leading-relaxed" : "text-xs leading-relaxed",
      )}
    >
      {steps.map((step) => (
        <li key={step}>{step}</li>
      ))}
    </ol>
  );
}

function PlatformInstallGuide({
  title,
  steps,
  footnote,
  compact,
  isFirst,
}: {
  title: string;
  steps: readonly string[];
  footnote: string;
  compact: boolean;
  isFirst: boolean;
}) {
  return (
    <div className={isFirst ? "" : "mt-3 border-t border-border/40 pt-3"}>
      <p className={cn("font-medium text-foreground", compact ? "text-[11px]" : "text-xs")}>
        {title}
      </p>
      <div className="mt-1.5">
        <StepList steps={steps} compact={compact} />
      </div>
      <p className={cn("mt-2 text-muted-foreground/90", compact ? "text-[10px]" : "text-[11px]")}>
        {footnote}
      </p>
    </div>
  );
}

export function PwaInstallGuide({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const onIos = isIosDevice();
  const onAndroid = isAndroidDevice();
  const showBoth = !onIos && !onAndroid;

  return (
    <div className={cn("rounded-xl bg-muted/30 px-3 py-2.5", className)}>
      <p className={cn("font-medium text-foreground", compact ? "text-[11px]" : "text-xs")}>
        홈 화면에 추가하는 방법
      </p>

      {(onIos || showBoth) && (
        <PlatformInstallGuide
          title={showBoth ? "iPhone (Safari)" : "iPhone"}
          steps={IOS_HOME_SCREEN_STEPS}
          footnote={getIosPushRequirementNote()}
          compact={compact}
          isFirst
        />
      )}

      {(onAndroid || showBoth) && (
        <PlatformInstallGuide
          title={showBoth ? "Android (Chrome)" : "Android"}
          steps={ANDROID_HOME_SCREEN_STEPS}
          footnote={getAndroidInstallNote()}
          compact={compact}
          isFirst={!showBoth && onAndroid}
        />
      )}
    </div>
  );
}
