# System Architecture

## Core Philosophy

1.  **Local-First:** The source of truth is ALWAYS the browser's IndexedDB (via PouchDB).
2.  **Offline-Capable:** The app must function 100% without an internet connection.
3.  **Sync:** Sync is an enhancement, not a requirement. It happens in the background.

## Data Flow

[UI Component] -> [Hook (useFilaments)] -> [Data Access Layer] -> [PouchDB]
^
| (Sync)
v
[Remote CouchDB]

## Monorepo Boundaries

- **UI:** purely presentational.
- **Data Access:** purely logic.
- **Utils:** stateless helpers.
