"use client";

import { FormEvent, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { getFieldKey, getFieldLabel, getVisibleFields } from "@/lib/config/fieldRuntime";
import { cn } from "@/lib/utils";
import type { Entity, Field } from "@/lib/config/types";

interface DynamicFormProps {
  entity: Entity;
  onSubmit: (values: Record<string, unknown>) => void | Promise<void>;
  initialData?: Record<string, unknown>;
  mode: "create" | "edit";
}

type FormErrors = Record<string, string>;

function getInitialValue(field: Field, initialData: Record<string, unknown> | undefined, key: string) {
  if (initialData?.[key] !== undefined) {
    return initialData[key];
  }
  if (field.defaultValue !== undefined) {
    return field.defaultValue;
  }
  return field.type === "boolean" ? false : "";
}

function formatInputValue(field: Field, value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }

  if ((field.type === "date" || field.type === "datetime") && typeof value === "string") {
    return field.type === "date" ? value.slice(0, 10) : value.slice(0, 16);
  }

  return String(value);
}

export function DynamicForm({ entity, onSubmit, initialData }: DynamicFormProps) {
  const visibleFields = useMemo(() => getVisibleFields(entity), [entity]);
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    const initialValues: Record<string, unknown> = {};
    if (initialData?._id !== undefined) initialValues._id = initialData._id;
    if (initialData?.id !== undefined) initialValues.id = initialData.id;
    return visibleFields.reduce<Record<string, unknown>>((acc, field, index) => {
      const key = getFieldKey(field, index);
      acc[key] = getInitialValue(field, initialData, key);
      return acc;
    }, initialValues);
  });
  const [errors, setErrors] = useState<FormErrors>({});

  function setFieldValue(key: string, value: unknown) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function validate() {
    return visibleFields.reduce<FormErrors>((acc, field, index) => {
      const key = getFieldKey(field, index);
      const value = values[key];
      const isEmpty = value === undefined || value === null || value === "";
      if (field.required && isEmpty) {
        acc[key] = `${getFieldLabel(field, index)} is required.`;
      }
      return acc;
    }, {});
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    await onSubmit(values);
  }

  function renderField(field: Field, index: number) {
    const key = getFieldKey(field, index);
    const label = getFieldLabel(field, index);
    const commonProps = {
      id: key,
      name: key,
      required: field.required,
      disabled: field.readonly,
      className: "rounded-xl bg-white/[0.03] border-white/10 focus:border-primary/50 transition-all duration-300",
    };

    if (field.type === "textarea") {
      return (
        <Textarea
          {...commonProps}
          placeholder={field.placeholder}
          value={formatInputValue(field, values[key])}
          onChange={(event) => setFieldValue(key, event.target.value)}
          className={cn(commonProps.className, "resize-none min-h-[100px]")}
        />
      );
    }

    if (field.type === "boolean") {
      return (
        <Switch
          {...commonProps}
          checked={Boolean(values[key])}
          onCheckedChange={(checked) => setFieldValue(key, checked)}
        />
      );
    }

    if (field.type === "select") {
      return (
        <Select {...commonProps} value={String(values[key] ?? "")} onChange={(event) => setFieldValue(key, event.target.value)}>
          <option value="" className="bg-background text-foreground">Select {label}</option>
          {(field.options ?? []).map((option) => (
            <option key={option} value={option} className="bg-background text-foreground">
              {option}
            </option>
          ))}
        </Select>
      );
    }

    if (field.type === "number") {
      return (
        <Input
          {...commonProps}
          type="number"
          placeholder={field.placeholder}
          value={formatInputValue(field, values[key])}
          onChange={(event) => setFieldValue(key, event.target.value === "" ? "" : Number(event.target.value))}
        />
      );
    }

    const supportedTypes = ["text", "textarea", "select", "checkbox", "number", "email", "date", "datetime"];
    const isUnsupported = !supportedTypes.includes(field.type ?? "text");

    return (
      <div className={cn(isUnsupported && "p-4 rounded-3xl bg-orange-500/5 border border-orange-500/10")}>
        {isUnsupported && <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-3 px-2">Schema Warning: Unsupported Type ({field.type})</p>}
        <Input
          {...commonProps}
          type={field.type === "email" ? "email" : field.type === "date" ? "date" : field.type === "datetime" ? "datetime-local" : "text"}
          placeholder={field.placeholder ?? `Enter ${label}...`}
          value={formatInputValue(field, values[key])}
          onChange={(event) => setFieldValue(key, event.target.value)}
          className="rounded-full bg-black/[0.02] border-black/[0.04] h-12 px-6 focus-visible:ring-primary/20 transition-all font-bold"
        />
      </div>
    );
  }

  return (
    <form id="dynamic-form" onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {visibleFields.map((field, index) => {
          const key = getFieldKey(field, index);
          const label = getFieldLabel(field, index);

          return (
            <div key={key} className={cn(
              "space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-500",
              field.type === "textarea" ? "md:col-span-2" : ""
            )} style={{ animationDelay: `${index * 50}ms` }}>
              <Label htmlFor={key} className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 flex items-center gap-1">
                {label}
                {field.required ? <span className="text-primary">*</span> : null}
              </Label>
              {renderField(field, index)}
              {field.description ? <p className="text-[10px] text-muted-foreground/60 italic">{field.description}</p> : null}
              {errors[key] ? <p className="text-xs text-destructive animate-in slide-in-from-left-2">{errors[key]}</p> : null}
            </div>
          );
        })}
      </div>
    </form>
  );
}

export default DynamicForm;
