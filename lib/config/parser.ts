import { z } from "zod";
import type { AppConfig, AuthConfig, Entity, Field, FieldType, UIConfig } from "./types";

const FIELD_TYPES = [
  "text",
  "textarea",
  "email",
  "number",
  "date",
  "datetime",
  "boolean",
  "select",
  "multiselect",
  "relation",
] as const satisfies readonly FieldType[];

const DEFAULT_FIELD: Required<Pick<Field, "name" | "label" | "type" | "required" | "unique" | "hidden" | "readonly" | "options">> = {
  name: "field",
  label: "Field",
  type: "text",
  required: false,
  unique: false,
  hidden: false,
  readonly: false,
  options: [],
};

const DEFAULT_ENTITY: Required<Pick<Entity, "name" | "label" | "labelPlural" | "description" | "fields" | "searchableFields" | "displayField" | "timestamps">> = {
  name: "Entity",
  label: "Entity",
  labelPlural: "Entities",
  description: "",
  fields: [],
  searchableFields: [],
  displayField: "id",
  timestamps: true,
};

const DEFAULT_APP_NAME = "Admin App";
const DEFAULT_LANG = "en";

const DEFAULT_UI: Required<Omit<UIConfig, "appName">> = {
  appDescription: "",
  theme: "system",
  primaryColor: "neutral",
  navigationStyle: "sidebar",
};

const DEFAULT_AUTH: Required<AuthConfig> = {
  enabled: false,
  providers: ["credentials"],
  requireEmailVerification: false,
  publicRoutes: ["/", "/login"],
  loginPath: "/login",
  afterLoginPath: "/dashboard",
};

const DEFAULT_APP_CONFIG: AppConfig = {
  appName: DEFAULT_APP_NAME,
  lang: DEFAULT_LANG,
  entities: [],
  ui: {
    appName: DEFAULT_APP_NAME,
    ...DEFAULT_UI,
  },
  auth: DEFAULT_AUTH,
};

const safeString = z.preprocess(
  (value) => (typeof value === "string" && value.trim().length > 0 ? value : undefined),
  z.string().optional(),
);

const fieldSchema = z
  .object({
    name: safeString,
    label: safeString,
    type: z.enum(FIELD_TYPES).optional(),
    required: z.boolean().optional(),
    unique: z.boolean().optional(),
    defaultValue: z.union([z.string(), z.number(), z.boolean(), z.null()]).optional(),
    placeholder: safeString,
    description: safeString,
    options: z.array(z.string()).optional(),
    relationTo: safeString,
    hidden: z.boolean().optional(),
    readonly: z.boolean().optional(),
  })
  .catchall(z.unknown())
  .transform((field): Field => ({
    ...DEFAULT_FIELD,
    ...field,
    label: field.label ?? field.name ?? DEFAULT_FIELD.label,
    options: field.options ?? DEFAULT_FIELD.options,
  }))
  .catch(DEFAULT_FIELD);

const entitySchema = z
  .object({
    name: safeString,
    label: safeString,
    labelPlural: safeString,
    description: z.string().optional().default(DEFAULT_ENTITY.description),
    icon: safeString,
    fields: z.array(fieldSchema).optional().default(DEFAULT_ENTITY.fields),
    searchableFields: z.array(z.string()).optional().default(DEFAULT_ENTITY.searchableFields),
    displayField: safeString,
    timestamps: z.boolean().optional().default(DEFAULT_ENTITY.timestamps),
  })
  .catchall(z.unknown())
  .transform((entity): Entity => ({
    ...DEFAULT_ENTITY,
    ...entity,
    label: entity.label ?? entity.name ?? DEFAULT_ENTITY.label,
    labelPlural: entity.labelPlural ?? `${entity.label ?? entity.name ?? DEFAULT_ENTITY.label}s`,
    displayField: entity.displayField ?? entity.fields[0]?.name ?? DEFAULT_ENTITY.displayField,
  }))
  .catch(DEFAULT_ENTITY);

const uiSchema = z
  .object({
    appName: safeString,
    appDescription: z.string().optional().default(DEFAULT_UI.appDescription),
    theme: z.enum(["light", "dark", "system"]).optional().default(DEFAULT_UI.theme),
    primaryColor: z.string().optional().default(DEFAULT_UI.primaryColor),
    navigationStyle: z.enum(["sidebar", "topbar"]).optional().default(DEFAULT_UI.navigationStyle),
  })
  .catchall(z.unknown())
  .catch(DEFAULT_UI);

const authSchema = z
  .object({
    enabled: z.boolean().optional().default(DEFAULT_AUTH.enabled),
    providers: z.array(z.enum(["credentials", "github", "google", "email"])).optional().default([...DEFAULT_AUTH.providers]),
    requireEmailVerification: z.boolean().optional().default(DEFAULT_AUTH.requireEmailVerification),
    publicRoutes: z.array(z.string()).optional().default([...DEFAULT_AUTH.publicRoutes]),
    loginPath: z.string().optional().default(DEFAULT_AUTH.loginPath),
    afterLoginPath: z.string().optional().default(DEFAULT_AUTH.afterLoginPath),
  })
  .catchall(z.unknown())
  .catch(DEFAULT_AUTH);

export const appConfigSchema = z
  .object({
    appName: safeString.default(DEFAULT_APP_NAME),
    lang: safeString.default(DEFAULT_LANG),
    entities: z.array(entitySchema).optional().default([]).catch([]),
    ui: uiSchema.optional(),
    auth: authSchema.optional(),
  })
  .catchall(z.unknown())
  .transform((config): AppConfig => ({
    appName: config.appName,
    lang: config.lang,
    entities: config.entities,
    ui: {
      appName: config.ui?.appName ?? config.appName,
      appDescription: config.ui?.appDescription ?? DEFAULT_UI.appDescription,
      theme: config.ui?.theme ?? DEFAULT_UI.theme,
      primaryColor: config.ui?.primaryColor ?? DEFAULT_UI.primaryColor,
      navigationStyle: config.ui?.navigationStyle ?? DEFAULT_UI.navigationStyle,
    },
    auth: config.auth ?? DEFAULT_AUTH,
  }))
  .catch(DEFAULT_APP_CONFIG);

export function parseConfig(raw: unknown): AppConfig {
  const result = appConfigSchema.safeParse(raw);

  if (result.success) {
    return result.data;
  }

  return DEFAULT_APP_CONFIG;
}
