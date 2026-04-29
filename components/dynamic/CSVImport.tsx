"use client";

import { useState, useRef } from "react";
import Papa from "papaparse";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast-provider";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import type { Entity } from "@/lib/config/types";
import { Upload, CheckCircle2, AlertCircle, Loader2, X, FileText, ChevronRight } from "lucide-react";

interface CSVImportProps {
  entity: Entity;
  onImportComplete: () => void;
}

export function CSVImport({ entity, onImportComplete }: CSVImportProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<Record<string, unknown>[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [successCount, setSuccessCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const entityFields = entity.fields || [];
  const requiredFields = entityFields.filter((field) => field.required && field.name);
  const mappedFieldNames = Object.values(mapping).filter(Boolean);
  const missingRequiredFields = requiredFields.filter((field) => !mappedFieldNames.includes(field.name as string));
  const importCount = csvData.length;
  const failureCount = errors.length;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results: Papa.ParseResult<Record<string, unknown>>) => {
          setCsvData(results.data);
          if (results.meta.fields) {
            setCsvHeaders(results.meta.fields);
            const newMapping: Record<string, string> = {};
            results.meta.fields.forEach((header: string) => {
              const field = entityFields.find(
                (f) =>
                  (f.name && f.name.toLowerCase() === header.toLowerCase()) ||
                  (f.label && f.label.toLowerCase() === header.toLowerCase())
              );
              if (field?.name) {
                newMapping[header] = field.name;
              }
            });
            setMapping(newMapping);
          }
        },
      });
    }
  };

  const handleImport = async () => {
    if (missingRequiredFields.length > 0) {
      setErrors(missingRequiredFields.map((field) => `${field.label || field.name} is required and must be mapped before import.`));
      toast({
        title: "CSV import blocked",
        description: "Map all required fields before starting the import.",
        variant: "error",
      });
      return;
    }

    setImporting(true);
    setProgress(0);
    setErrors([]);
    setSuccessCount(0);
    let nextSuccessCount = 0;
    const nextErrors: string[] = [];

    const entityName = entity.name || entity.label || "entity";

    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];
      const payload: Record<string, unknown> = {};

      Object.entries(mapping).forEach(([csvHeader, entityFieldName]) => {
        if (entityFieldName) {
          payload[entityFieldName] = row[csvHeader];
        }
      });

      try {
        const response = await fetch(`/api/data/${encodeURIComponent(entityName)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const result = await response.json().catch(() => ({}));
          throw new Error(result.error || `Row ${i + 1}: ${response.statusText}`);
        }
        nextSuccessCount += 1;
        setSuccessCount(nextSuccessCount);
      } catch (err) {
        nextErrors.push(err instanceof Error ? err.message : String(err));
        setErrors([...nextErrors]);
      }
      setProgress(i + 1);
    }

    setImporting(false);
    onImportComplete();
    toast({
      title: "CSV import finished",
      description: `${nextSuccessCount} succeeded, ${nextErrors.length} failed.`,
      variant: nextErrors.length > 0 ? "info" : "success",
    });
  };

  const reset = () => {
    setFile(null);
    setCsvData([]);
    setCsvHeaders([]);
    setMapping({});
    setProgress(0);
    setErrors([]);
    setSuccessCount(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <>
      <Button variant="outline" className="gap-2 rounded-xl glass border-white/10" onClick={() => setIsOpen(true)}>
        <Upload className="h-4 w-4" />
        {t("Import CSV")}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] glass border-white/10 rounded-3xl p-0 overflow-hidden flex flex-col scale-in-center">
          <div className="p-8 border-b border-white/5 flex items-center justify-between">
             <div className="flex items-center gap-3">
               <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
               </div>
               <div>
                 <DialogTitle className="text-xl font-bold">{t("Import CSV")}</DialogTitle>
                 <p className="text-sm text-muted-foreground">{entity.labelPlural || entity.label || entity.name}</p>
               </div>
             </div>
             <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
             </Button>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar p-8">
            {!file ? (
              <div 
                className="group relative flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl p-16 transition-all hover:border-primary/50 hover:bg-primary/5 active:scale-[0.99]"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="h-20 w-20 rounded-full bg-muted/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <Upload className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-1">{t("Select CSV file")}</h3>
                <p className="text-sm text-muted-foreground mb-6">Drop your file here or click to browse</p>
                <Input
                  type="file"
                  accept=".csv"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button size="sm" className="rounded-xl px-6">Choose File</Button>
              </div>
            ) : (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">{t("Preview")} (First 5 rows)</h3>
                    <Button variant="ghost" size="sm" className="h-7 text-xs rounded-lg gap-2" onClick={reset}>
                       <X className="h-3 w-3" /> Remove File
                    </Button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Rows detected</p>
                      <p className="mt-2 text-2xl font-black text-foreground">{importCount}</p>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Columns detected</p>
                      <p className="mt-2 text-2xl font-black text-foreground">{csvHeaders.length}</p>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Required mappings</p>
                      <p className="mt-2 text-2xl font-black text-foreground">{requiredFields.length - missingRequiredFields.length}/{requiredFields.length}</p>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-x-auto no-scrollbar">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/5 hover:bg-transparent">
                          {csvHeaders.map((header) => (
                            <TableHead key={header} className="text-[10px] font-bold uppercase tracking-tighter py-3">{header}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {csvData.slice(0, 5).map((row, i) => (
                          <TableRow key={i} className="border-white/5 hover:bg-transparent">
                            {csvHeaders.map((header) => (
                              <TableCell key={header} className="text-xs py-3 max-w-[150px] truncate">{String(row[header] ?? "")}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">{t("Column Mapping")}</h3>
                  <div className="grid gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-6 shadow-inner">
                    {csvHeaders.map((header) => (
                      <div key={header} className="flex items-center gap-4 group">
                        <div className="flex-1 bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 text-sm font-medium transition-colors group-hover:border-primary/30">
                          {header}
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
                        <div className="flex-1">
                          <Select
                            value={mapping[header] || "skip"}
                            className="rounded-xl border-white/5 bg-white/[0.03] focus:border-primary/50"
                            onChange={(e) => {
                              const val = e.target.value;
                              setMapping(prev => ({ ...prev, [header]: val === "skip" ? "" : val }));
                            }}
                          >
                            <option value="skip" className="bg-background text-foreground text-xs uppercase tracking-widest font-bold">Skip</option>
                            {entityFields.map(f => (
                              <option key={f.name} value={f.name} className="bg-background text-foreground">
                                {f.label || f.name}
                              </option>
                            ))}
                          </Select>
                        </div>
                      </div>
                    ))}
                  </div>
                  {missingRequiredFields.length > 0 && (
                    <div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 p-4 text-sm text-orange-700">
                      <p className="font-bold uppercase tracking-widest text-[10px] mb-2">Missing required mappings</p>
                      <p>{missingRequiredFields.map((field) => field.label || field.name).join(", ")}</p>
                    </div>
                  )}
                </div>

                {importing && (
                  <div className="space-y-3 animate-in zoom-in-95">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                      <span className="text-primary">{t("Importing")}</span>
                      <span className="text-foreground">{progress}/{csvData.length}</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                        style={{ width: `${(progress / csvData.length) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {progress === csvData.length && !importing && (
                  <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-6 text-green-400 flex items-center gap-4 animate-in zoom-in-95">
                    <div className="h-12 w-12 rounded-xl bg-green-500/20 flex items-center justify-center animate-bounce">
                       <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-lg font-bold">{t("Done!")}</p>
                        <p className="text-sm opacity-80">{successCount} {t("records imported successfully")}</p>
                        <p className="text-xs opacity-70">{failureCount} failed</p>
                    </div>
                  </div>
                )}

                {errors.length > 0 && (
                  <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-6 text-destructive-foreground space-y-3 animate-in zoom-in-95">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className="h-5 w-5" />
                      <p className="text-sm font-bold uppercase tracking-widest">{t("Error Log")}</p>
                    </div>
                    <div className="max-h-32 overflow-y-auto no-scrollbar text-xs space-y-1 pre-wrap font-mono opacity-80">
                      {errors.map((err, i) => <p key={i}>• {err}</p>)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-8 border-t border-white/5 flex justify-end gap-3 glass">
            <Button variant="ghost" className="rounded-xl px-8" onClick={() => { setIsOpen(false); reset(); }} disabled={importing}>
              {t("Close")}
            </Button>
            {file && (
              <Button 
                onClick={handleImport} 
                disabled={importing || !file || Object.values(mapping).every(v => !v) || missingRequiredFields.length > 0}
                className="rounded-xl px-12 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 gap-2"
              >
                {importing && <Loader2 className="h-4 w-4 animate-spin" />}
                {importing ? t("Processing") : t("Start Import")}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
