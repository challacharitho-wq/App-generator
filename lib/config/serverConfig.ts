import defaultConfig from "./defaultConfig";
import { parseConfig } from "./parser";
import type { AppConfig } from "./types";

function mergeConfigWithDefault(loadedConfig: unknown): AppConfig {
  const parsed = parseConfig(loadedConfig);
  const defaultEntities = defaultConfig.entities ?? [];

  if (!parsed.entities || parsed.entities.length < defaultEntities.length) {
    parsed.entities = defaultEntities;
  }

  if (!parsed.entities || parsed.entities.length === 0) {
    parsed.entities = defaultConfig.entities;
  }

  return parsed;
}

export async function getServerConfig(): Promise<AppConfig> {
  try {
    const { getPrismaClient } = await import("@/lib/prisma");
    const prisma = getPrismaClient();
    const doc = await prisma.appConfigState.findUnique({
      where: { key: "current" },
    });

    if (doc) {
      return mergeConfigWithDefault(doc.value);
    }

    return defaultConfig;
  } catch (error) {
    console.error("Failed to fetch server config:", error);
    return defaultConfig;
  }
}

export async function updateServerConfig(config: AppConfig): Promise<void> {
  const { getPrismaClient } = await import("@/lib/prisma");
  const prisma = getPrismaClient();
  await prisma.appConfigState.upsert({
    where: { key: "current" },
    update: {
      value: config as never,
    },
    create: {
      key: "current",
      value: config as never,
    },
  });
}

export async function clearServerConfig(): Promise<void> {
  const { getPrismaClient } = await import("@/lib/prisma");
  const prisma = getPrismaClient();
  await prisma.appConfigState.deleteMany({
    where: { key: "current" },
  });
}
