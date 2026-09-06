interface WebPushErrorLike {
  statusCode?: number;
  body?: string;
  message?: string;
}

export function formatWebPushError(error: unknown): string {
  if (!error || typeof error !== "object") {
    return "Push 알림 전송에 실패했습니다.";
  }

  const err = error as WebPushErrorLike;
  const statusCode = err.statusCode;
  const detail = typeof err.body === "string" ? err.body : err.message;

  if (statusCode === 401 || statusCode === 403) {
    return "VAPID 키가 이 기기 구독과 맞지 않습니다. Push 알림을 끄고 다시 켜 주세요.";
  }

  if (statusCode === 404 || statusCode === 410) {
    return "Push 구독이 만료되었습니다. Push 알림을 끄고 다시 켜 주세요.";
  }

  if (statusCode) {
    return `Push 서버 오류 (${statusCode}). Push 알림을 끄고 다시 켜 주세요.`;
  }

  if (detail?.includes("unexpected response code")) {
    return "Push 서버가 요청을 거부했습니다. Push 알림을 끄고 다시 켜 주세요.";
  }

  return detail ?? "Push 알림 전송에 실패했습니다.";
}

export function isStaleWebPushSubscription(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const statusCode = (error as WebPushErrorLike).statusCode;
  return statusCode === 404 || statusCode === 410;
}

export function isVapidMismatchError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const statusCode = (error as WebPushErrorLike).statusCode;
  return statusCode === 401 || statusCode === 403;
}
