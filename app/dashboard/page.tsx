"use client";

import { useEffect, useMemo, useState } from "react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import DynamicView from "@/components/dynamic/DynamicView";
import { useAppConfig } from "@/lib/config/useAppConfig";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { FloatingHeader } from "@/components/FloatingHeader";
import { MobileNavBar } from "@/components/MobileNavBar";
import type { Entity } from "@/lib/config/types";

function getEntityKey(entity: Entity, index: number) {
  return entity.name ?? entity.label ?? `entity_${index}`;
}

export default function DashboardPage() {
  const { config } = useAppConfig();
  const { t } = useTranslation();
  const entities = useMemo(() => config.entities ?? [], [config.entities]);
  const [selectedEntityKey, setSelectedEntityKey] = useState(() => (entities[0] ? getEntityKey(entities[0], 0) : ""));
  const selectedEntity = entities.find((entity, index) => getEntityKey(entity, index) === selectedEntityKey) ?? entities[0];

  useEffect(() => {
    console.log("Dashboard sidebar entities:", entities);
  }, [entities]);

  useEffect(() => {
    if (!entities.length) {
      setSelectedEntityKey("");
      return;
    }

    const hasSelectedEntity = entities.some((entity, index) => getEntityKey(entity, index) === selectedEntityKey);

    if (!hasSelectedEntity) {
      setSelectedEntityKey(getEntityKey(entities[0], 0));
    }
  }, [entities, selectedEntityKey]);

  if (!selectedEntity) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-6">
        <div className="floating-island p-16 text-center max-w-md animate-in zoom-in-95 duration-700">
           <div className="h-20 w-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
           </div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground mb-4">{t("No entities configured")}</h1>
          <p className="text-muted-foreground font-bold">{t("Infrastructure Manifest missing. Please upload a valid configuration.")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <FloatingHeader />
      <DashboardSidebar 
        config={config} 
        selectedEntityKey={selectedEntityKey} 
        onSelectEntity={setSelectedEntityKey} 
      />
      <main className="lg:pl-[300px] pt-[150px] pb-32 lg:pb-12 px-6 lg:pr-12">
        <div className="max-w-[1400px] mx-auto min-h-[calc(100vh-180px)] floating-island p-10 lg:p-16 border-black/[0.03] animate-in fade-in slide-in-from-bottom-12 duration-1000">
          <DynamicView entity={selectedEntity} view="table" />
        </div>
      </main>
      <MobileNavBar />
    </div>
  );
}
