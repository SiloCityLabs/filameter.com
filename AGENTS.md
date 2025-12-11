# SiloCityPages Framework Agent Instructions

## Identity & Purpose

This is the **Master Framework Repository**.

- This code is consumed by multiple downstream projects (like `filameter.com`).
- **Critical:** Changes here must be backward compatible whenever possible.
- **Role:** You are a Framework Maintainer, not just a Feature Developer. Prioritize stability, reusability, and clean type definitions.

## Monorepo Architecture

- **Root (`.`)**: Next.js 15 App Router shell (The "Example" implementation).
- **`packages/ui-core`**: Reusable React Bootstrap components. _Do not add app-specific logic here._
- **`packages/utils`**: Pure TS/JS utility functions. No React code unless absolutely necessary.
- **`packages/data-access`**: PouchDB / Local-first database abstractions.

## Tech Stack Constraints

- **Styling:** Strict **React Bootstrap** + **CSS Modules** (`*.module.css`).
  - ❌ DO NOT use Tailwind CSS (it is not configured in the core).
  - ✅ DO use `<Container>`, `<Row>`, `<Col>` for layout.
- **Package Manager:** `pnpm` (Workspace strictness enabled).
- **Icons:** FontAwesome (`@fortawesome/react-fontawesome`).

## Operational Rules

1. **Linting is Strict:** Run `pnpm lint` before finishing any task. We use a custom shared config in `packages/eslint-config`.
2. **Generic Components:** When modifying `packages/ui-core`, ensure components are generic.
   - _Bad:_ `export const FilamentCard ...` (Too specific)
   - _Good:_ `export const SclCard ...` (Generic, reusable)
3. **No Hidden Dependencies:** If you add a library to a package, verify it is in that package's `package.json`, not just the root.
4. **Docs:** If you change a generic component, update the TSDoc comments so downstream developers know how to use it.
