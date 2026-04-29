import { Prisma } from "@prisma/client";

type QueryResult<T> = {
  data: T | null;
  error: string | null;
};

type EntityRecord = Record<string, unknown>;

function toSafeError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Database operation failed.";
}

function isJsonRecord(value: Prisma.JsonValue): value is Prisma.JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toRecordData(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(
    JSON.stringify(value, (_key, item) => {
      if (item instanceof Date) {
        return item.toISOString();
      }

      return item;
    }),
  ) as Prisma.InputJsonValue;
}

function normalizeEntityPayload(record: {
  id: string;
  entityType: string;
  recordData: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
}) {
  const payload = isJsonRecord(record.recordData) ? { ...record.recordData } : {};

  return {
    id: record.id,
    ...payload,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  } as EntityRecord;
}

function matchesSearch(record: EntityRecord, searchQuery?: string, searchableFields: string[] = []) {
  const query = searchQuery?.trim().toLowerCase();

  if (!query) {
    return true;
  }

  const targetFields = searchableFields.length > 0 ? searchableFields : Object.keys(record);

  return targetFields.some((field) => {
    const value = record[field];

    if (value === null || value === undefined) {
      return false;
    }

    if (Array.isArray(value)) {
      return value.join(" ").toLowerCase().includes(query);
    }

    return String(value).toLowerCase().includes(query);
  });
}

export async function listRecords(
  entityName: string,
  userId: string,
  options?: { searchQuery?: string; searchableFields?: string[] },
): Promise<QueryResult<EntityRecord[]>> {
  try {
    const { getPrismaClient } = await import("@/lib/prisma");
    const prisma = getPrismaClient();
    const data = await prisma.entityRecord.findMany({
      where: {
        userId,
        entityType: entityName,
      },
      orderBy: { createdAt: "desc" },
    });

    const normalized = data
      .map((record) => normalizeEntityPayload(record))
      .filter((record) => matchesSearch(record, options?.searchQuery, options?.searchableFields));

    return { data: normalized, error: null };
  } catch (error) {
    return { data: null, error: toSafeError(error) };
  }
}

export async function createRecord(
  entityName: string,
  userId: string,
  data: EntityRecord,
): Promise<QueryResult<EntityRecord>> {
  try {
    const { getPrismaClient } = await import("@/lib/prisma");
    const prisma = getPrismaClient();
    const record = await prisma.entityRecord.create({
      data: {
        userId,
        entityType: entityName,
        recordData: toRecordData(data),
      },
    });

    return { data: normalizeEntityPayload(record), error: null };
  } catch (error) {
    return { data: null, error: toSafeError(error) };
  }
}

export async function updateRecord(
  entityName: string,
  userId: string,
  id: string,
  data: EntityRecord,
): Promise<QueryResult<EntityRecord>> {
  try {
    const { getPrismaClient } = await import("@/lib/prisma");
    const prisma = getPrismaClient();
    const existingRecord = await prisma.entityRecord.findFirst({
      where: { id, userId, entityType: entityName },
    });

    if (!existingRecord) {
      return { data: null, error: "Record not found." };
    }

    const existingData = isJsonRecord(existingRecord.recordData) ? existingRecord.recordData : {};
    const mergedData = {
      ...existingData,
      ...data,
    };

    const record = await prisma.entityRecord.update({
      where: { id },
      data: {
        recordData: toRecordData(mergedData),
      },
    });

    return { data: normalizeEntityPayload(record), error: null };
  } catch (error) {
    return { data: null, error: toSafeError(error) };
  }
}

export async function deleteRecord(
  entityName: string,
  userId: string,
  id: string,
): Promise<QueryResult<EntityRecord>> {
  try {
    const { getPrismaClient } = await import("@/lib/prisma");
    const prisma = getPrismaClient();
    const existingRecord = await prisma.entityRecord.findFirst({
      where: { id, userId, entityType: entityName },
    });

    if (!existingRecord) {
      return { data: null, error: "Record not found." };
    }

    const record = await prisma.entityRecord.delete({
      where: { id },
    });

    return { data: normalizeEntityPayload(record), error: null };
  } catch (error) {
    return { data: null, error: toSafeError(error) };
  }
}
