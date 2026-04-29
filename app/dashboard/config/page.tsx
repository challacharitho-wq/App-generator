"use client";

import { useEffect, useState } from "react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast-provider";
import { useAppConfig } from "@/lib/config/useAppConfig";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { parseConfig } from "@/lib/config/parser";
import { AlertCircle, CheckCircle2, Upload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { FloatingHeader } from "@/components/FloatingHeader";

export default function ConfigPage() {
  const { config, updateConfig, isLoading } = useAppConfig();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [jsonValue, setJsonValue] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (config) {
      setJsonValue(JSON.stringify(config, null, 2));
    }
  }, [config]);

  const handleSave = async () => {
    try {
      const parsed = parseConfig(JSON.parse(jsonValue));
      await updateConfig(parsed);
      setStatus({ type: "success", message: t("Config updated successfully") });
      toast({
        title: "Config updated",
        description: "Runtime configuration refreshed successfully.",
        variant: "success",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : t("Invalid config");
      setStatus({ type: "error", message });
      toast({
        title: "Config update failed",
        description: message,
        variant: "error",
      });
    }
  };

  const handleReset = async () => {
    try {
      const response = await fetch("/api/config", {
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "Failed to reset config");
      }

      localStorage.removeItem("app_config");
      window.location.reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : t("Invalid config");
      setStatus({ type: "error", message });
      toast({
        title: "Reset failed",
        description: message,
        variant: "error",
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const content = event.target?.result as string;
        setJsonValue(content);
        try {
          const parsed = parseConfig(JSON.parse(content));
          await updateConfig(parsed);
          setStatus({ type: "success", message: t("Config updated successfully") });
          toast({
            title: "Config uploaded",
            description: "New modules are available immediately.",
            variant: "success",
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : t("Invalid config");
          setStatus({ type: "error", message });
          toast({
            title: "Config upload failed",
            description: message,
            variant: "error",
          });
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <FloatingHeader />
      <DashboardSidebar config={config} />
      <main className="lg:pl-[300px] pt-[140px] pb-10 px-8 lg:pr-12">
        <div className="max-w-5xl mx-auto floating-island p-10 lg:p-14 border-black/[0.03] animate-in fade-in slide-in-from-bottom-12 duration-1000">
          <div className="space-y-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                   <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{t("Engine Control")}</span>
                </div>
                <h1 className="text-4xl font-black tracking-tighter text-foreground">{t("Config")}</h1>
                <p className="text-muted-foreground text-sm font-bold mt-2">Architectural Blueprint & Dynamic Runtime Settings.</p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="ghost" className="rounded-2xl border border-black/[0.05] hover:bg-black/[0.02] h-12 px-6 font-bold" onClick={handleReset}>
                  {t("Reset Config")}
                </Button>
                <div className="relative">
                  <Input
                    type="file"
                    accept=".json"
                    className="absolute inset-0 z-10 cursor-pointer opacity-0"
                    onChange={handleFileUpload}
                  />
                  <Button className="gap-3 rounded-2xl orange-gradient h-12 px-8 font-black shadow-xl shadow-orange-500/20 active:scale-95 transition-all">
                    <Upload className="h-4.5 w-4.5" />
                    {t("Upload Config")}
                  </Button>
                </div>
              </div>
            </div>

            {status && (
              <div className={cn(
                "flex items-center gap-4 rounded-3xl border p-6 backdrop-blur-3xl animate-in zoom-in-95 duration-500",
                status.type === "success" 
                  ? "border-green-500/10 bg-green-500/5 text-green-600 shadow-xl shadow-green-500/5" 
                  : "border-destructive/10 bg-destructive/5 text-destructive-foreground shadow-xl shadow-destructive/5"
              )}>
                <div className={cn("h-10 w-10 rounded-2xl flex items-center justify-center shrink-0", 
                  status.type === "success" ? "bg-green-500/20" : "bg-destructive/20")}>
                    {status.type === "success" ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                </div>
                <p className="text-sm font-black tracking-tight">{status.message}</p>
              </div>
            )}

            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                 <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/50">{t("Infrastructure Manifest")}</h2>
                 {isLoading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
              </div>
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative">
                   <div className="absolute top-4 right-4 z-10">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                   </div>
                   <Textarea
                    value={jsonValue}
                    onChange={(e) => setJsonValue(e.target.value)}
                    className="relative min-h-[600px] font-mono text-[13px] bg-black/[0.02] border-black/[0.05] rounded-[2rem] p-10 focus:ring-2 focus:ring-primary/20 no-scrollbar resize-none leading-loose shadow-inner"
                    spellCheck={false}
                  />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button onClick={handleSave} className="rounded-full px-12 orange-gradient h-14 font-black shadow-2xl shadow-orange-500/30 transition-all hover:scale-105 active:scale-95 text-sm uppercase tracking-widest">
                  {t("Apply Deployment")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
