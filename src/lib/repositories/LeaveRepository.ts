import { createId, nowIso } from "@/lib/db/mappers";
import { enqueueSync } from "@/lib/sync";
import type { CreateLeaveInput, LeaveRecord, UpdateLeaveInput } from "@/types/local";
import { localLeaveStore } from "./local";

function toLeaveRecord(local: import("@/types/local").LocalLeaveRecord): LeaveRecord {
  return {
    id: local.id,
    userId: local.userId,
    date: local.date,
    memo: local.memo,
    createdAt: local.createdAt,
    updatedAt: local.updatedAt,
  };
}

export class LeaveRepository {
  async getAll(userId: string): Promise<LeaveRecord[]> {
    const records = await localLeaveStore.getAll(userId);
    return records.map(toLeaveRecord);
  }

  async getByDate(userId: string, date: string): Promise<LeaveRecord | null> {
    const record = await localLeaveStore.getByDate(userId, date);
    return record ? toLeaveRecord(record) : null;
  }

  async create(userId: string, input: CreateLeaveInput): Promise<LeaveRecord> {
    const existing = await localLeaveStore.getByDate(userId, input.date);
    if (existing) {
      return this.update(userId, existing.id, input);
    }

    const timestamp = nowIso();
    const record = {
      id: createId(),
      userId,
      date: input.date,
      memo: input.memo ?? null,
      createdAt: timestamp,
      updatedAt: timestamp,
      syncStatus: "pending" as const,
    };

    await localLeaveStore.put(record);
    await enqueueSync(userId, {
      operation: "upsert",
      entity: "leave_record",
      entityId: record.id,
      payload: record,
    });

    return toLeaveRecord(record);
  }

  async update(userId: string, id: string, input: UpdateLeaveInput): Promise<LeaveRecord> {
    const existing = await localLeaveStore.getById(id);
    if (!existing || existing.userId !== userId) {
      throw new Error("Leave record not found");
    }

    const record = {
      ...existing,
      date: input.date ?? existing.date,
      memo: input.memo !== undefined ? input.memo : existing.memo,
      updatedAt: nowIso(),
      syncStatus: "pending" as const,
    };

    await localLeaveStore.put(record);
    await enqueueSync(userId, {
      operation: "upsert",
      entity: "leave_record",
      entityId: record.id,
      payload: record,
    });

    return toLeaveRecord(record);
  }

  async delete(userId: string, id: string): Promise<void> {
    const existing = await localLeaveStore.getById(id);
    if (!existing || existing.userId !== userId) {
      throw new Error("Leave record not found");
    }

    await localLeaveStore.delete(id);
    await enqueueSync(userId, {
      operation: "delete",
      entity: "leave_record",
      entityId: id,
    });
  }
}

export const leaveRepository = new LeaveRepository();
