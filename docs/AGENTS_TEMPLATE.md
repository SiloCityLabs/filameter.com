# [Project Name] Agent Instructions

## Project Purpose

This project is a local-first web application built on the **SiloCityPages Framework**.

## Technical Stack (Inherited)

This project inherits its core architecture from the upstream `SiloCityLabs/SiloCityPages` framework.

- **Framework:** Next.js 15 (App Router) + React 19
- **Language:** TypeScript (Strict)
- **UI Library:** React Bootstrap (via `@silocitypages/ui-core`)
- **Styling:** CSS Modules (`*.module.css`) - **NO Tailwind CSS**
- **Database:** PouchDB (Client-side / Local-first)
- **Package Manager:** pnpm

## Monorepo Boundaries

This repo uses pnpm workspaces. You must understand where code belongs:

1.  **`src/app/` (YOUR WORKSPACE)**
    - This is where 90% of your work happens.
    - Contains pages, layouts, and app-specific logic.
    - **Rule:** You can freely import from `packages/*`, but do not modify `packages/*` unless you are fixing a framework bug.

2.  **`packages/ui-core` (READ-ONLY)**
    - Contains generic UI components (`SclCard`, `CustomModal`, `SclBadge`).
    - **Rule:** Use these components instead of standard HTML tags where possible.
    - **Rule:** If you need a new generic component, ask if it already exists here first.

3.  **`packages/data-access` (READ-ONLY)**
    - Handles PouchDB connections and document types.
    - **Rule:** Use the helpers here for all database operations (`save`, `delete`, `get`). Do not write raw `new PouchDB()` calls in the app.

## Operational Commands

- **Start Dev Server:** `pnpm dev` (Runs Next.js on localhost:3000)
- **Build Production:** `pnpm build` (Builds dependencies first, then the app)
- **Linting:** `pnpm lint` (Uses shared config from `@silocitypages/eslint-config`)
- **Testing:** `pnpm test` (Jest)

## Coding Standards

- **Local First:** This app must work offline. Avoid adding cloud dependencies (Firebase, AWS) unless explicitly requested.
- **Imports:** Use absolute imports for app code: `import { ... } from '@/components/...'`.
- **Icons:** Use FontAwesome: `import { faHome } from '@fortawesome/free-solid-svg-icons'`.
