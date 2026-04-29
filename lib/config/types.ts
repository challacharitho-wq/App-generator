export type FieldType =
  | "text"
  | "textarea"
  | "email"
  | "number"
  | "date"
  | "datetime"
  | "boolean"
  | "select"
  | "multiselect"
  | "relation";

export interface Field {
  name?: string;
  label?: string;
  type?: FieldType;
  required?: boolean;
  unique?: boolean;
  defaultValue?: string | number | boolean | null;
  placeholder?: string;
  description?: string;
  options?: string[];
  relationTo?: string;
  hidden?: boolean;
  readonly?: boolean;
}

export interface Entity {
  name?: string;
  label?: string;
  labelPlural?: string;
  description?: string;
  icon?: string;
  fields?: Field[];
  searchableFields?: string[];
  displayField?: string;
  timestamps?: boolean;
}

export interface UIConfig {
  appName?: string;
  appDescription?: string;
  theme?: "light" | "dark" | "system";
  primaryColor?: string;
  navigationStyle?: "sidebar" | "topbar";
}

export interface AuthConfig {
  enabled?: boolean;
  providers?: Array<"credentials" | "github" | "google" | "email">;
  requireEmailVerification?: boolean;
  publicRoutes?: string[];
  loginPath?: string;
  afterLoginPath?: string;
}

export interface AppConfig {
  appName?: string;
  lang?: string;
  entities?: Entity[];
  ui?: UIConfig;
  auth?: AuthConfig;
}