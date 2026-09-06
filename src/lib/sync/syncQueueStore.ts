import { createId, nowIso } from "@/lib/db/mappers";
import { shiftDb } from "@/lib/db/shiftDb";
import type { SyncEntity, SyncOperation, SyncQueueItem } from "@/types/sync";

export interface EnqueueSyncInput {
  userId: string;
  operation: SyncOperation;
  entity: SyncEntity;
  entityId: string;
  payload?: unknown;
}

export const syncQueueStore = {
  async enqueue(input: EnqueueSyncInput): Promise<SyncQueueItem> {
    const existing = await shiftDb.syncQueue
      .where("[userId+entity+entityId]")
      .equals([input.userId, input.entity, input.entityId])
      .first();

    const item: SyncQueueItem = {
      id: existing?.id ?? createId(),
      userId: input.userId,
      operation: input.operation,
      entity: input.entity,
      entityId: input.entityId,
      payload: input.payload ? JSON.stringify(input.payload) : "",
      createdAt: existing?.createdAt ?? nowIso(),
      retryCount: existing?.retryCount ?? 0,
    };

    await shiftDb.syncQueue.put(item);
    return item;
  },

  async getPending(userId: string): Promise<SyncQueueItem[]> {
    return shiftDb.syncQueue.where("userId").equals(userId).sortBy("createdAt");
  },

  async countPending(userId: string): Promise<number> {
    return shiftDb.syncQueue.where("userId").equals(userId).count();
  },

  async remove(id: string): Promise<void> {
    await shiftDb.syncQueue.delete(id);
  },

  async markFailed(item: SyncQueueItem, error: string): Promise<void> {
    await shiftDb.syncQueue.put({
      ...item,
      retryCount: item.retryCount + 1,
      lastError: error,
    });
  },

  async clearUser(userId: string): Promise<void> {
    await shiftDb.syncQueue.where("userId").equals(userId).delete();
  },
};
