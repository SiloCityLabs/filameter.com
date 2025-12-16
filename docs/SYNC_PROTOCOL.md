# Sync Protocol

## Strategy

We use a standard CouchDB replication protocol with custom tweaks.

## Key Files

- `src/helpers/sync/pullData.ts`: Fetches remote changes.
- `src/helpers/sync/pushData.ts`: Uploads local changes.

## Conflict Resolution

- **User Settings:** Last write wins.
- **Filament Spools:** Merged based on `_rev` tags.
- **Critical:** NEVER force-push over a remote change without checking `_rev` first.
