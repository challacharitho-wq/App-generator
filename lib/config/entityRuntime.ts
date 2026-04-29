import type { AppConfig, Entity, Field } from "./types";

function normalizeEntityToken(value?: string) {
  return value?.trim().toLowerCase() ?? "";
}

export function getEntityName(entity: Entity) {
  return entity.name ?? entity.label ?? "entity";
}

export function findEntity(config: AppConfig, entityName: string): Entity | null {
  const normalizedEntityName = normalizeEntityToken(entityName);
  const entities = config.entities ?? [];

  return (
    entities.find((entity) => {
      return (
        normalizeEntityToken(entity.name) === normalizedEntityName ||
        normalizeEntityToken(entity.label) === normalizedEntityName ||
        normalizeEntityToken(entity.labelPlural) === normalizedEntityName
      );
    }) ?? null
  );
}

export function normalizeFieldValue(field: Field, value: unknown) {
  if (value === "" || value === undefined || value === null) {
    return null;
  }

  if (field.type === "number") {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : value;
  }

  if (field.type === "boolean") {
    return value === true || value === "true";
  }

  if (field.type === "date" || field.type === "datetime") {
    return typeof value === "string" ? value : value instanceof Date ? value.toISOString() : value;
  }

  if (field.type === "multiselect") {
    if (Array.isArray(value)) {
      return value;
    }

    return typeof value === "string"
      ? value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : value;
  }

  return value;
}

export function validateRecordData(entity: Entity, body: Record<string, unknown>, mode: "create" | "update") {
  const data: Record<string, unknown> = {};
  const fields = entity.fields ?? [];

  for (const field of fields) {
    if (!field.name || field.hidden || field.readonly) {
      continue;
    }

    if (mode === "update" && !(field.name in body)) {
      continue;
    }

    const rawValue = body[field.name];
    const value = normalizeFieldValue(field, rawValue);
    const isMissing = value === null || value === undefined || value === "";

    if (mode === "create" && field.required && isMissing && field.defaultValue === undefined) {
      return { data: null, error: `${field.label ?? field.name ?? "Field"} is required.` };
    }

    if (!isMissing) {
      data[field.name] = value;
    } else if (mode === "create" && field.defaultValue !== undefined) {
      data[field.name] = field.defaultValue;
    }
  }

  return { data, error: null };
}
