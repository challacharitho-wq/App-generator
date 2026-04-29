"use client";

import { useMemo } from "react";

import { Pencil, Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getFieldKey, getFieldLabel, getRenderableFields } from "@/lib/config/fieldRuntime";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { cn } from "@/lib/utils";
import type { Entity, Field } from "@/lib/config/types";

interface DynamicTableProps {
  entity: Entity;
  data: Record<string, unknown>[];
  onEdit?: (row: Record<string, unknown>) => void;
  onDelete?: (id: unknown, row: Record<string, unknown>) => void;
}

function formatValue(value: unknown) {
  if (typeof value === "boolean") {
    return (
      <span className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        value ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
      )}>
        {value ? "Yes" : "No"}
      </span>
    );
  }

  if (value === null || value === undefined || value === "") {
    return <span className="text-muted-foreground/30">—</span>;
  }

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  return String(value);
}

function getRowIdentifier(row: Record<string, unknown>, visibleFields: Field[]) {
  const explicitId = row._id ?? row.id;

  if (explicitId !== undefined) {
    return explicitId;
  }

  const firstFieldName = visibleFields.find((field) => field.name)?.name;
  return firstFieldName ? row[firstFieldName] : undefined;
}

export function DynamicTable({ entity, data, onEdit, onDelete }: DynamicTableProps) {
  const { t } = useTranslation();
  const renderableFields = useMemo(() => getRenderableFields(entity, data), [entity, data]);

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in duration-1000">
        <div className="h-20 w-20 bg-black/[0.02] rounded-full flex items-center justify-center mb-6">
           <MoreHorizontal className="h-10 w-10 text-muted-foreground/30 animate-pulse" />
        </div>
        <h3 className="text-2xl font-black tracking-tight text-foreground">{t("No records yet")}</h3>
        <p className="mt-3 text-sm font-medium text-muted-foreground max-w-xs">{t("Create the first record to see it listed here.")}</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-x-auto no-scrollbar rounded-[2rem]">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-black/[0.03]">
            {renderableFields.map((field, index) => (
              <TableHead key={getFieldKey(field, index)} className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 py-6 px-4">
                {getFieldLabel(field, index)}
              </TableHead>
            ))}
            <TableHead className="w-24 text-right text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 py-6 px-4">
              {t("Actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => {
            const rowIdentifier = getRowIdentifier(row, renderableFields);

            return (
              <TableRow 
                key={String(rowIdentifier ?? rowIndex)} 
                className="group border-white/5 hover:bg-white/[0.02] transition-colors duration-200"
              >
                {renderableFields.map((field, fieldIndex) => {
                  const key = getFieldKey(field, fieldIndex);
                  return (
                    <TableCell key={key} className="py-4 text-sm font-medium text-foreground/90">
                      {formatValue(row[key])}
                    </TableCell>
                  );
                })}
                <TableCell className="py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="rounded-xl border border-black/[0.05] bg-white/70 px-3 text-foreground hover:bg-black/[0.04]"
                      onClick={() => onEdit?.(row)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      {t("Edit")}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="rounded-xl border border-destructive/15 bg-destructive/5 px-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => onDelete?.(row._id ?? row.id, row)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {t("Delete")}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export default DynamicTable;
