import type { Entity, Field } from "./types";

export function getFieldKey(field: Field, index: number) {
  return field.name ?? `field_${index}`;
}

export function getFieldLabel(field: Field, index: number) {
  return field.label ?? field.name ?? `Field ${index + 1}`;
}

export function getVisibleFields(entity: Entity) {
  return (entity.fields ?? []).filter((field) => !field.hidden);
}

export function getRenderableFields(entity: Entity, data: Record<string, unknown>[]) {
  const visibleFields = getVisibleFields(entity);

  if (visibleFields.length > 0) {
    return visibleFields;
  }

  if (data.length === 0) {
    return [];
  }

  return Object.keys(data[0])
    .filter((key) => !["id", "_id", "userId", "createdAt", "updatedAt"].includes(key))
    .map(
      (key): Field => ({
        name: key,
        label: key.charAt(0).toUpperCase() + key.slice(1),
        type: "text",
      }),
    );
}
