export interface PushClientConfig {
  configured: boolean;
  publicKey: string | null;
}

let cachedConfig: PushClientConfig | null = null;

export async function fetchPushConfig(): Promise<PushClientConfig> {
  if (cachedConfig) {
    return cachedConfig;
  }

  try {
    const response = await fetch("/api/push/config");
    if (!response.ok) {
      return { configured: false, publicKey: null };
    }

    const payload = (await response.json()) as PushClientConfig;
    cachedConfig = {
      configured: Boolean(payload.configured && payload.publicKey),
      publicKey: payload.publicKey ?? null,
    };
    return cachedConfig;
  } catch {
    return { configured: false, publicKey: null };
  }
}

export function clearPushConfigCache(): void {
  cachedConfig = null;
}
