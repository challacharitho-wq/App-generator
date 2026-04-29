"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { Settings, LayoutDashboard, Box, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Entity, AppConfig } from "@/lib/config/types";
import { signOut } from "next-auth/react";

interface DashboardSidebarProps {
  config: AppConfig;
  selectedEntityKey?: string;
  onSelectEntity?: (key: string) => void;
}

export function DashboardSidebar({ config, selectedEntityKey, onSelectEntity }: DashboardSidebarProps) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const entities = config.entities ?? [];

  function getEntityKey(entity: Entity, index: number) {
    return entity.name ?? entity.label ?? `entity_${index}`;
  }

  return (
    <aside className="fixed left-8 top-4 bottom-4 w-[280px] z-50 floating-island p-6 flex flex-col hidden lg:flex animate-in slide-in-from-left-12 duration-1000 overflow-hidden">
      <div className="mb-6 px-2">
         <div className="flex items-center gap-4 group cursor-pointer">
            <div className="h-10 w-10 rounded-2xl orange-gradient flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:rotate-12 transition-transform duration-500">
               <Box className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tighter text-foreground group-hover:text-primary transition-colors">
                {config.ui?.appName ?? config.appName}
              </h2>
              <div className="h-0.5 w-0 bg-primary group-hover:w-full transition-all duration-500 rounded-full" />
            </div>
         </div>
      </div>

      <nav className="flex-1 min-h-0 space-y-1 overflow-y-auto no-scrollbar">
        <div className="px-2 mb-3">
          <Link href="/dashboard">
            <Button
              variant={pathname === "/dashboard" ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-4 rounded-[1.25rem] h-12 px-5 transition-all duration-300",
                pathname === "/dashboard" 
                  ? "orange-gradient shadow-xl shadow-orange-500/20 font-bold" 
                  : "text-muted-foreground hover:bg-black/[0.03] hover:text-foreground font-bold"
              )}
            >
              <LayoutDashboard className={cn("h-4.5 w-4.5", pathname === "/dashboard" ? "text-white" : "text-muted-foreground")} />
              <span>{t("Dashboard")}</span>
            </Button>
          </Link>
        </div>

        {pathname === "/dashboard" && onSelectEntity && (
          <div className="px-2 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 px-5 mb-2">
              Platform Data
            </p>
            <div className="max-h-40 space-y-1 overflow-y-auto no-scrollbar pr-1">
              {entities.map((entity, index) => {
                const key = getEntityKey(entity, index);
                const isSelected = key === selectedEntityKey;

                return (
                  <Button
                    key={key}
                    type="button"
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-5 rounded-[1.25rem] h-12 px-5 transition-all duration-300 group border",
                      isSelected 
                        ? "border-orange-500/90 bg-orange-500 text-white shadow-lg shadow-orange-500/20 hover:bg-orange-500 hover:text-white" 
                        : "border-transparent bg-transparent text-foreground hover:bg-black/[0.04] hover:text-foreground"
                    )}
                    onClick={() => onSelectEntity(key)}
                  >
                    <div className={cn(
                      "h-1.5 w-1.5 rounded-full transition-all duration-500",
                      isSelected ? "bg-white scale-150 shadow-[0_0_8px_rgba(255,255,255,0.8)]" : "bg-slate-500 group-hover:bg-slate-700"
                    )} />
                    <span
                      className={cn(
                        "truncate text-sm font-bold tracking-tight",
                        isSelected ? "text-white" : "text-foreground"
                      )}
                    >
                      {entity.labelPlural ?? entity.label ?? entity.name ?? "Entity"}
                    </span>
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-4 px-2 pt-4 border-t border-black/[0.03]">
          <Link href="/dashboard/config">
            <Button
              variant={pathname === "/dashboard/config" ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-4 rounded-[1.25rem] h-12 px-5 transition-all duration-300",
                pathname === "/dashboard/config" 
                  ? "orange-gradient shadow-xl shadow-orange-500/20 font-bold" 
                  : "text-muted-foreground hover:bg-black/[0.03] hover:text-foreground font-bold"
              )}
            >
              <Settings className={cn("h-4.5 w-4.5", pathname === "/dashboard/config" ? "text-white" : "text-muted-foreground")} />
              <span>{t("Config")}</span>
            </Button>
          </Link>
        </div>
      </nav>

      <div className="mt-4 pt-4 border-t border-black/[0.03] px-2">
        <div className="flex flex-col gap-2">
           <Button
             variant="ghost"
             onClick={() => signOut({ callbackUrl: "/login" })}
             className="w-full justify-start gap-4 rounded-[1.25rem] h-10 px-5 text-destructive hover:bg-destructive/10 hover:text-destructive font-bold transition-all duration-300"
           >
             <LogOut className="h-4.5 w-4.5" />
             <span className="text-xs uppercase tracking-widest">Sign Out</span>
           </Button>
        </div>
      </div>
    </aside>
  );
}
