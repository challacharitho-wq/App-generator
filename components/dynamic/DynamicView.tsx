"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";

import DynamicForm from "@/components/dynamic/DynamicForm";
import DynamicTable from "@/components/dynamic/DynamicTable";
import ErrorBoundary from "@/components/dynamic/ErrorBoundary";
import { CSVImport } from "@/components/dynamic/CSVImport";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast-provider";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { Plus, Zap, AlertCircle, Loader2, Search, X } from "lucide-react";
import type { Entity } from "@/lib/config/types";

interface DynamicViewProps {
  entity: Entity;
  view: "form" | "table";
}

type ApiPayload<T> = {
  data?: T;
  error?: string | null;
};

function getEntityName(entity: Entity) {
  return entity.name ?? entity.label ?? "entity";
}

function getRecordId(row?: Record<string, unknown>) {
  return row?._id ?? row?.id;
}

function normalizeListPayload(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) {
    return payload as Record<string, unknown>[];
  }

  if (payload && typeof payload === "object" && "data" in payload) {
    const data = (payload as ApiPayload<unknown>).data;
    return Array.isArray(data) ? (data as Record<string, unknown>[]) : [];
  }

  return [];
}

export function DynamicView({ entity, view }: DynamicViewProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(view === "form");
  const [editingRow, setEditingRow] = useState<Record<string, unknown> | undefined>();
  const [rowPendingDelete, setRowPendingDelete] = useState<Record<string, unknown> | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const entityName = useMemo(() => getEntityName(entity), [entity]);
  const encodedEntityName = encodeURIComponent(entityName);
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const searchParam = deferredSearchQuery.trim();

  const fetchData = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setError(null);

    try {
      const querySuffix = searchParam ? `?q=${encodeURIComponent(searchParam)}` : "";
      const response = await fetch(`/api/data/${encodedEntityName}${querySuffix}`, { signal });
      const payload = (await response.json().catch(() => null)) as ApiPayload<unknown> | null;

      if (!response.ok || payload?.error) {
        throw new Error(payload?.error ?? `Request failed with status ${response.status}`);
      }

      setData(normalizeListPayload(payload));
    } catch (fetchError) {
      if (!signal?.aborted) {
        setError(fetchError instanceof Error ? fetchError.message : "Unable to load data.");
        setData([]);
      }
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, [encodedEntityName, searchParam]);

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);

    return () => controller.abort();
  }, [fetchData]);

  async function handleSubmit(values: Record<string, unknown>) {
    setIsSubmitting(true);
    setError(null);

    try {
      const recordId = getRecordId(editingRow);
      const isEditing = Boolean(editingRow && recordId);
      const response = await fetch(
        isEditing ? `/api/data/${encodedEntityName}/${encodeURIComponent(String(recordId))}` : `/api/data/${encodedEntityName}`,
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        },
      );
      const payload = (await response.json().catch(() => null)) as ApiPayload<unknown> | null;

      if (!response.ok || payload?.error) {
        throw new Error(payload?.error ?? `Request failed with status ${response.status}`);
      }

      setEditingRow(undefined);
      setIsFormOpen(false);
      await fetchData();
      toast({
        title: editingRow ? "Record updated" : "Record created",
        description: `${entity.label ?? entity.name ?? "Record"} saved successfully.`,
        variant: "success",
      });
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Unable to save record.";
      setError(message);
      toast({
        title: "Unable to save record",
        description: message,
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleEdit(row: Record<string, unknown>) {
    setEditingRow(row);
    setIsFormOpen(true);
  }

  async function handleDelete(id: unknown) {
    if (!id) {
      setError("Unable to delete record: missing record id.");
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/data/${encodedEntityName}/${encodeURIComponent(String(id))}`, {
        method: "DELETE",
      });
      const payload = (await response.json().catch(() => null)) as ApiPayload<unknown> | null;

      if (!response.ok || payload?.error) {
        throw new Error(payload?.error ?? `Request failed with status ${response.status}`);
      }

      await fetchData();
      setRowPendingDelete(null);
      toast({
        title: "Record deleted",
        description: `${entity.label ?? entity.name ?? "Record"} removed successfully.`,
        variant: "success",
      });
    } catch (deleteError) {
      const message = deleteError instanceof Error ? deleteError.message : "Unable to delete record.";
      setError(message);
      toast({
        title: "Unable to delete record",
        description: message,
        variant: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <ErrorBoundary entityName={entity.label ?? entity.name}>
      <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
               <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
               <span className="text-[10px] font-bold uppercase tracking-widest text-primary/80">Active Entity</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-foreground">{entity.labelPlural ?? entity.label ?? entity.name}</h1>
            {entity.description ? <p className="mt-2 text-muted-foreground/80 max-w-2xl leading-relaxed">{entity.description}</p> : null}
            {error ? (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive-foreground">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            ) : null}
          </div>
          <div className="flex flex-col gap-3 sm:items-end">
            <div className="flex w-full max-w-md items-center gap-2 rounded-2xl border border-black/[0.05] bg-black/[0.02] px-4 py-2 shadow-sm">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={`Search ${entity.labelPlural ?? entity.label ?? entity.name ?? "records"}...`}
                className="h-8 border-none bg-transparent px-0 py-0 shadow-none focus-visible:ring-0"
              />
              {searchQuery ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-full"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              ) : null}
            </div>
            <CSVImport entity={entity} onImportComplete={() => fetchData()} />
            <div className="flex gap-3">
              <Button
                type="button"
                className="rounded-xl px-6 shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 gap-2"
                onClick={() => {
                  setEditingRow(undefined);
                  setIsFormOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                {t("New")} {entity.label ?? entity.name ?? t("Entity")}
              </Button>
            </div>
          </div>
        </div>

        <div className="premium-card">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium text-muted-foreground animate-pulse">{t("Loading")}...</p>
            </div>
          ) : view === "form" ? (
            <DynamicForm entity={entity} mode={editingRow ? "edit" : "create"} initialData={editingRow} onSubmit={handleSubmit} />
          ) : (
            <div className="overflow-hidden no-scrollbar">
               <DynamicTable
                 entity={entity}
                 data={data}
                 onEdit={handleEdit}
                 onDelete={(id, row) => {
                   setError(null);
                   setRowPendingDelete(row ?? null);
                 }}
               />
            </div>
          )}
        </div>

        <Dialog open={isFormOpen && view !== "form"} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-2xl glass border-white/10 rounded-3xl p-8 scale-in-center overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
               <Zap className="h-32 w-32 text-primary" />
            </div>
            <DialogHeader className="mb-8">
              <DialogTitle className="text-2xl font-bold">{editingRow ? t("Update") : t("Create")} {entity.label ?? entity.name ?? t("Entity")}</DialogTitle>
              <p className="text-sm text-muted-foreground">Fill in the details below to {editingRow ? 'update the' : 'create a new'} record.</p>
            </DialogHeader>
            <div className="space-y-6">
              <DynamicForm entity={entity} mode={editingRow ? "edit" : "create"} initialData={editingRow} onSubmit={handleSubmit} />
              <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                <Button type="button" variant="ghost" className="rounded-xl" disabled={isSubmitting} onClick={() => setIsFormOpen(false)}>
                  {t("Cancel")}
                </Button>
                <Button type="button" className="rounded-xl px-8 shadow-lg shadow-primary/20" disabled={isSubmitting} onClick={() => (document.querySelector('form') as HTMLFormElement)?.requestSubmit()}>
                   {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                   {editingRow ? t("Save") : t("Create")}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={Boolean(rowPendingDelete)} onOpenChange={(open) => !open && setRowPendingDelete(null)}>
          <DialogContent className="max-w-md rounded-3xl p-8">
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-2xl font-bold">Delete record?</DialogTitle>
              <p className="text-sm text-muted-foreground">
                This action cannot be undone. The selected {entity.label ?? entity.name ?? "record"} will be permanently removed.
              </p>
            </DialogHeader>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" className="rounded-xl" disabled={isDeleting} onClick={() => setRowPendingDelete(null)}>
                {t("Cancel")}
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="rounded-xl px-6"
                disabled={isDeleting}
                onClick={() => handleDelete(getRecordId(rowPendingDelete ?? undefined))}
              >
                {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </section>
    </ErrorBoundary>
  );
}

export default DynamicView;
