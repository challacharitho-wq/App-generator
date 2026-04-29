import type { AppConfig } from "./types";

export const defaultConfig: AppConfig = {
  appName: "Workflow CRM",
  lang: "en",
  ui: {
    appName: "Workflow CRM",
    appDescription: "A lightweight lead and task workspace.",
    theme: "system",
    primaryColor: "neutral",
    navigationStyle: "sidebar",
  },
  auth: {
    enabled: true,
    providers: ["credentials"],
    requireEmailVerification: false,
    publicRoutes: ["/", "/login"],
    loginPath: "/login",
    afterLoginPath: "/dashboard",
  },
  entities: [
    {
      name: "Lead",
      label: "Lead",
      labelPlural: "Leads",
      description: "User-facing sales leads captured from forms, imports, or outreach.",
      icon: "UserRoundPlus",
      displayField: "name",
      searchableFields: ["name", "email", "company"],
      timestamps: true,
      fields: [
        {
          name: "name",
          label: "Name",
          type: "text",
          required: true,
          placeholder: "Ada Lovelace",
        },
        {
          name: "email",
          label: "Email",
          type: "email",
          required: true,
          unique: true,
          placeholder: "ada@example.com",
        },
        {
          name: "company",
          label: "Company",
          type: "text",
          placeholder: "Analytical Engines Ltd.",
        },
        {
          name: "status",
          label: "Status",
          type: "select",
          required: true,
          defaultValue: "new",
          options: ["new", "contacted", "qualified", "lost"],
        },
        {
          name: "estimatedValue",
          label: "Estimated Value",
          type: "number",
          defaultValue: 0,
        },
      ],
    },
    {
      name: "Task",
      label: "Task",
      labelPlural: "Tasks",
      description: "Follow-up work items for leads and internal operations.",
      icon: "CircleCheckBig",
      displayField: "title",
      searchableFields: ["title", "status", "priority"],
      timestamps: true,
      fields: [
        {
          name: "title",
          label: "Title",
          type: "text",
          required: true,
          placeholder: "Follow up with lead",
        },
        {
          name: "dueDate",
          label: "Due Date",
          type: "date",
        },
        {
          name: "priority",
          label: "Priority",
          type: "select",
          defaultValue: "medium",
          options: ["low", "medium", "high"],
        },
        {
          name: "status",
          label: "Status",
          type: "select",
          required: true,
          defaultValue: "todo",
          options: ["todo", "in_progress", "done"],
        },
        {
          name: "notes",
          label: "Notes",
          type: "textarea",
          placeholder: "Add context for the next step.",
        },
      ],
    },
  ],
};

export default defaultConfig;