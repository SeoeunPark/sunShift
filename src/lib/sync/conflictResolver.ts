export function compareUpdatedAt(localUpdatedAt: string, remoteUpdatedAt: string): number {
  return new Date(localUpdatedAt).getTime() - new Date(remoteUpdatedAt).getTime();
}

/** Last-write-wins: returns true if local should win */
export function shouldLocalWin(localUpdatedAt: string, remoteUpdatedAt: string): boolean {
  return compareUpdatedAt(localUpdatedAt, remoteUpdatedAt) >= 0;
}

export function resolveLastWriteWins<T extends { updatedAt: string }>(
  local: T,
  remote: T,
): { winner: T; source: "local" | "remote" } {
  if (shouldLocalWin(local.updatedAt, remote.updatedAt)) {
    return { winner: local, source: "local" };
  }
  return { winner: remote, source: "remote" };
}
