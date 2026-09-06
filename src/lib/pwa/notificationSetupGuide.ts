export const IOS_NOTIFICATION_SETUP_STEPS = [
  "Safari에서 SHIFT 열기",
  "공유 → 홈 화면에 추가",
  "홈 화면 SHIFT 아이콘으로 열기 (Safari 탭 말고)",
  "로그인",
  "Push 알림 켜기 + 알림 허용",
  "근무 · 수면 알림에서 받을 알림 선택",
] as const;

export const ANDROID_NOTIFICATION_SETUP_STEPS = [
  "Chrome에서 SHIFT 열기",
  "메뉴(⋮) → 앱 설치 또는 홈 화면에 추가",
  "홈 화면 SHIFT 아이콘으로 열기",
  "로그인",
  "Push 알림 켜기 + 알림 허용",
  "근무 · 수면 알림에서 받을 알림 선택",
] as const;

export function getInstallInstructions(): string {
  if (typeof window === "undefined") {
    return "";
  }

  if (isIosDevice()) {
    return "Safari 공유 버튼 → '홈 화면에 추가'를 선택하세요.";
  }

  if (isAndroidDevice()) {
    return "Chrome 메뉴 → '앱 설치' 또는 '홈 화면에 추가'를 선택하세요.";
  }

  return "브라우저 주소창의 설치 아이콘을 사용하세요.";
}

export function isIosDevice(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export function isAndroidDevice(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return /android/i.test(window.navigator.userAgent);
}

export function getIosPushRequirementNote(): string {
  return "iPhone은 Safari 탭이 아니라 홈 화면에 추가한 앱에서만 Push 알림을 받을 수 있습니다.";
}

export function getAndroidPushNote(): string {
  return "Android는 Chrome 사용을 권장합니다. 홈 화면에 추가하면 앱처럼 열고 알림을 받을 수 있습니다.";
}

export function getNotificationSetupFootnote(platform: "ios" | "android"): string {
  if (platform === "ios") {
    return "앱을 닫아도 정해진 시간에 알림이 옵니다. iOS 16.4 이상, Safari 필수.";
  }

  return "앱을 닫아도 정해진 시간에 알림이 옵니다. Chrome 권장.";
}
