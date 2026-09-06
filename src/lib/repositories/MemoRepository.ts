import { createId, nowIso } from "@/lib/db/mappers";
import { enqueueSync } from "@/lib/sync";
import type { CreateMemoInput, MemoRecord, UpdateMemoInput } from "@/types/local";
import { localMemoStore } from "./local";

function toMemoRecord(local: import("@/types/local").LocalMemoRecord): MemoRecord {
  return {
    id: local.id,
    userId: local.userId,
    date: local.date,
    content: local.content,
    createdAt: local.createdAt,
    updatedAt: local.updatedAt,
  };
}

export class MemoRepository {
  async getAll(userId: string): Promise<MemoRecord[]> {
    const records = await localMemoStore.getAll(userId);
    return records.map(toMemoRecord);
  }

  async getByDate(userId: string, date: string): Promise<MemoRecord | null> {
    const record = await localMemoStore.getByDate(userId, date);
    return record ? toMemoRecord(record) : null;
  }

  async create(userId: string, input: CreateMemoInput): Promise<MemoRecord> {
    const existing = await localMemoStore.getByDate(userId, input.date);
    if (existing) {
      return this.update(userId, existing.id, input);
    }

    const timestamp = nowIso();
    const record = {
      id: createId(),
      userId,
      date: input.date,
      content: input.content,
      createdAt: timestamp,
      updatedAt: timestamp,
      syncStatus: "pending" as const,
    };

    await localMemoStore.put(record);
    await enqueueSync(userId, {
      operation: "upsert",
      entity: "memo_record",
      entityId: record.id,
      payload: record,
    });

    return toMemoRecord(record);
  }

  async update(userId: string, id: string, input: UpdateMemoInput): Promise<MemoRecord> {
    const existing = await localMemoStore.getById(id);
    if (!existing || existing.userId !== userId) {
      throw new Error("Memo record not found");
    }

    const record = {
      ...existing,
      date: input.date ?? existing.date,
      content: input.content ?? existing.content,
      updatedAt: nowIso(),
      syncStatus: "pending" as const,
    };

    await localMemoStore.put(record);
    await enqueueSync(userId, {
      operation: "upsert",
      entity: "memo_record",
      entityId: record.id,
      payload: record,
    });

    return toMemoRecord(record);
  }

  async delete(userId: string, id: string): Promise<void> {
    const existing = await localMemoStore.getById(id);
    if (!existing || existing.userId !== userId) {
      throw new Error("Memo record not found");
    }

    await localMemoStore.delete(id);
    await enqueueSync(userId, {
      operation: "delete",
      entity: "memo_record",
      entityId: id,
    });
  }
}

export const memoRepository = new MemoRepository();
