# FilaMeter Agent Instructions

## Project Context

This is a local-first **Next.js 15 + React 19** monorepo managed with **pnpm**.

- **Core Framework:** Next.js (App Router)
- **Database:** PouchDB (Client-side/Local-first)
- **UI Library:** React Bootstrap + CSS Modules
- **Package Manager:** pnpm (Strict workspace boundaries)

## Monorepo Structure

- `src/` -> Main application logic (Next.js App Router).
- `packages/data-access/` -> Database logic and PouchDB wrappers.
- `packages/ui-core/` -> Shared UI components (Cards, Badges, Modals).
- `packages/utils/` -> Helper functions (Analytics, Formatters).

## Operational Commands

- **Install:** `pnpm install`
- **Dev Server:** `pnpm dev` (Runs on http://localhost:3000)
- **Build:** `pnpm build` (Runs workspace builds first, then Next.js build)
- **Lint:** `pnpm lint` or `pnpm qlint` (Quiet lint)
- **Test:** `pnpm test` (Jest)

## Global Boundaries & Rules

1. **Strict Types:** No `any`. Use specific interfaces defined in `src/types` or local package types.
2. **Local First:** This app works offline. Do NOT add features that require cloud connectivity without fallback.
3. **Styling:** Use CSS Modules (`*.module.css`) for custom styles. Do not use Tailwind classes (we use Bootstrap).
4. **Imports:** Use absolute paths `@/*` for app imports. Use workspace protocols `workspace:*` for package dependencies.
