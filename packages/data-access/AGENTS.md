# Data Access Agent Instructions

## Scope

This package handles all interactions with PouchDB. It abstracts the raw database calls from the UI.

## Technology Stack

- **PouchDB:** version 9.0.0
- **Adapters:** `pouchdb-adapter-idb` (IndexedDB)
- **Plugins:** `pouchdb-find`

## Coding Standards

1. **Error Handling:** All database operations must be wrapped in `try/catch` blocks. PouchDB errors should be normalized before returning to the UI.
2. **Typing:** All documents must extend the generic `PouchDB.Core.Document<T>`.
3. **Migrations:** Database schema changes must be handled in `src/helpers/database/*/migrate*.ts`.
4. **No UI Code:** This package should NEVER import React components or UI logic.

## Common Tasks

- **Add new entity:** Create a folder in `src/pouchDb/` with `save.ts`, `delete.ts`, and `get*.ts`.
- **Sync:** Sync logic is handled in `src/helpers/sync`. Respect the "Offline First" principle.
