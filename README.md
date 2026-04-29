# Config-Driven CRM Runtime

A recruiter-ready CRM internship project built with Next.js, TypeScript, Prisma, PostgreSQL, and Tailwind CSS.

This app is intentionally designed as a config-driven runtime:

- Upload a config file
- Define entities and fields
- Get sidebar navigation automatically
- Get forms, tables, search, CSV import, and CRUD automatically
- Add a brand new module without writing new frontend or backend CRUD code

## Highlights

- Dynamic entity runtime powered by `config.entities[]`
- True generic persistence with a universal `EntityRecord` model
- Config-backed runtime with instant module activation
- Search driven by `searchableFields`
- CSV import with mapping, validation, preview, and summary
- Auth-protected dashboard experience
- Clean TypeScript and production-safe error handling

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Prisma
- PostgreSQL
- Tailwind CSS
- NextAuth

## Architecture

### 1. Config Runtime

The app configuration is stored in `AppConfigState` and parsed through the config layer:

- [lib/config/defaultConfig.ts](/abs/path/c:/Project/lib/config/defaultConfig.ts)
- [lib/config/parser.ts](/abs/path/c:/Project/lib/config/parser.ts)
- [lib/config/useAppConfig.ts](/abs/path/c:/Project/lib/config/useAppConfig.ts)
- [lib/config/serverConfig.ts](/abs/path/c:/Project/lib/config/serverConfig.ts)

Runtime behavior comes from:

- `entities[]`
- `fields[]`
- `searchableFields`
- labels, placeholders, defaults, and field metadata

### 2. Generic Persistence

Instead of hardcoding `Lead` and `Task` tables, the backend now uses a universal Prisma model:

- `EntityRecord`
  - `entityType`
  - `recordData` as JSON
  - `userId`
  - timestamps

This means a newly uploaded entity can immediately support:

- create
- read
- update
- delete

without adding new backend handlers or Prisma models.

### 3. Dynamic UI Rendering

The UI is generated from config metadata:

- Sidebar navigation from `config.entities`
- Forms from `fields[]`
- Tables from visible fields
- Search from `searchableFields`
- CSV import mapping from field definitions

Key files:

- [components/DashboardSidebar.tsx](/abs/path/c:/Project/components/DashboardSidebar.tsx)
- [components/dynamic/DynamicView.tsx](/abs/path/c:/Project/components/dynamic/DynamicView.tsx)
- [components/dynamic/DynamicForm.tsx](/abs/path/c:/Project/components/dynamic/DynamicForm.tsx)
- [components/dynamic/DynamicTable.tsx](/abs/path/c:/Project/components/dynamic/DynamicTable.tsx)
- [components/dynamic/CSVImport.tsx](/abs/path/c:/Project/components/dynamic/CSVImport.tsx)

## Features

### Core CRM

- Dashboard shell
- Dynamic sidebar modules
- Leads module
- Tasks module
- Config upload page
- Auth UI

### Dynamic Runtime

- Config upload refreshes runtime immediately
- New entities appear in the sidebar automatically
- New fields appear in create/edit forms automatically
- New fields appear in tables automatically
- Search works using config-defined searchable fields

### CRUD

- Create
- Read
- Update
- Delete
- Delete confirmation

### CSV Import

- File preview
- Column mapping
- Required-field validation
- Import progress
- Success/failure summary

### UX Polish

- Toast notifications
- Loading states
- Empty states
- Safe error messages
- Responsive controls for dashboard views

## Database Model

The app now targets PostgreSQL.

Prisma models:

- `User`
- `EntityRecord`
- `AppConfigState`

Schema file:

- [prisma/schema.prisma](/abs/path/c:/Project/prisma/schema.prisma)

Migration artifact:

- [prisma/migrations/20260428_generic_runtime_postgres/migration.sql](/abs/path/c:/Project/prisma/migrations/20260428_generic_runtime_postgres/migration.sql)

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Use:

- [.env.example](/abs/path/c:/Project/.env.example)

Required variables:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/config_crm?schema=public"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Generate Prisma client

```bash
npm run prisma:generate
```

### 4. Push or migrate schema

```bash
npm run prisma:push
```

or

```bash
npm run prisma:migrate
```

### 5. Seed demo data

```bash
npx tsx lib/db/seed.ts
```

### 6. Run the app

```bash
npm run dev
```

## Demo Credentials

Seed script creates:

- Email: `demo@example.com`
- Password: `demo12345`

## Recruiter Demo Flow

### Default walkthrough

1. Sign in with the demo account
2. Open Leads and Tasks
3. Create a record
4. Search records
5. Import a CSV
6. Edit config from the config page

### Wow-factor walkthrough

Upload:

- [public/examples/project-module-config.json](/abs/path/c:/Project/public/examples/project-module-config.json)

This instantly adds a brand new `Project` module with:

- sidebar navigation
- dynamic create/edit form
- dynamic table
- search
- CRUD
- CSV import

No new backend CRUD code is required for that module.

## API Overview

### Config

- `GET /api/config`
- `POST /api/config`
- `DELETE /api/config`

### Generic Data Runtime

- `GET /api/data/[entity]`
- `POST /api/data/[entity]`
- `PUT /api/data/[entity]/[id]`
- `DELETE /api/data/[entity]/[id]`

## Production Readiness Notes

- TypeScript passes
- ESLint passes
- Config and runtime logic are centralized
- Dynamic CRUD no longer depends on hardcoded entity tables
- Toast feedback and destructive action confirmation are included

## What Makes This Strong for Recruiters

- It demonstrates architecture thinking, not just page building
- It shows config-driven product design
- It shows generic backend design with practical constraints
- It balances polish with maintainability
- It proves dynamic modules can ship without repetitive CRUD scaffolding
