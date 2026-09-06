/** Server-only VAPID config (never use NEXT_PUBLIC_ — public key is served via /api/push/config). */
export function getVapidPublicKey(): string | null {
  return process.env.VAPID_PUBLIC_KEY?.trim() ?? null;
}

export function isPushConfigured(): boolean {
  return Boolean(
    getVapidPublicKey() &&
      process.env.VAPID_PRIVATE_KEY?.trim() &&
      getVapidSubject(),
  );
}

export function getVapidSubject(): string {
  return (process.env.VAPID_SUBJECT ?? "mailto:admin@example.com").trim();
}
