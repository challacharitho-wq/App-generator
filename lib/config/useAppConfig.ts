"use client";

import { useCallback, useEffect, useState } from "react";
import defaultConfig from "./defaultConfig";
import { parseConfig } from "./parser";
import type { AppConfig } from "./types";

const APP_CONFIG_STORAGE_KEY = "app_config";
const APP_CONFIG_UPDATED_EVENT = "app-config-updated";

function persistConfig(config: AppConfig) {
  localStorage.setItem(APP_CONFIG_STORAGE_KEY, JSON.stringify(config));
  window.dispatchEvent(new CustomEvent(APP_CONFIG_UPDATED_EVENT, { detail: config }));
}

function mergeConfigWithDefault(loadedConfig: unknown): AppConfig {
  const parsed = parseConfig(loadedConfig);

  return {
    ...defaultConfig,
    ...parsed,
    ui: {
      ...defaultConfig.ui,
      ...parsed.ui,
    },
    auth: {
      ...defaultConfig.auth,
      ...parsed.auth,
    },
    entities: parsed.entities && parsed.entities.length > 0 ? parsed.entities : defaultConfig.entities,
  };
}

export function useAppConfig() {
  const [config, setConfig] = useState<AppConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState(true);

  const reloadConfig = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Try to load from server first (Source of Truth)
      const response = await fetch("/api/config");
      if (response.ok) {
        const serverConfig = await response.json();
        const merged = mergeConfigWithDefault(serverConfig);
        setConfig(merged);
        persistConfig(merged);
      } else {
        const stored = localStorage.getItem(APP_CONFIG_STORAGE_KEY);
        if (stored) {
          setConfig(mergeConfigWithDefault(JSON.parse(stored)));
        } else {
          setConfig(defaultConfig);
        }
      }
    } catch (error) {
      console.error("Failed to reload config:", error);
      const stored = localStorage.getItem(APP_CONFIG_STORAGE_KEY);
      if (stored) {
        setConfig(mergeConfigWithDefault(JSON.parse(stored)));
      } else {
        setConfig(defaultConfig);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetConfig = useCallback(async () => {
    setIsLoading(true);
    try {
      // Reset on server
      await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(defaultConfig),
      });
      localStorage.removeItem(APP_CONFIG_STORAGE_KEY);
      window.dispatchEvent(new CustomEvent(APP_CONFIG_UPDATED_EVENT, { detail: defaultConfig }));
      setConfig(defaultConfig);
    } catch (error) {
       console.error("Failed to reset config:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateConfig = useCallback(async (newConfig: AppConfig) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConfig)
      });
      if (response.ok) {
        const merged = mergeConfigWithDefault(newConfig);
        setConfig(merged);
        persistConfig(merged);
      }
    } catch (error) {
      console.error("Failed to update config:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    reloadConfig();
  }, [reloadConfig]);

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== APP_CONFIG_STORAGE_KEY || !event.newValue) {
        return;
      }

      setConfig(mergeConfigWithDefault(JSON.parse(event.newValue)));
    }

    function handleConfigUpdate(event: Event) {
      const customEvent = event as CustomEvent<AppConfig>;
      setConfig(mergeConfigWithDefault(customEvent.detail));
    }

    window.addEventListener("storage", handleStorage);
    window.addEventListener(APP_CONFIG_UPDATED_EVENT, handleConfigUpdate as EventListener);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(APP_CONFIG_UPDATED_EVENT, handleConfigUpdate as EventListener);
    };
  }, []);

  return { config, isLoading, reloadConfig, resetConfig, updateConfig };
}
