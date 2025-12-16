# Technical Context & Constraints

## Allowed Libraries

- **Styling:** CSS Modules (`*.module.css`) + React Bootstrap.
- **State:** React Context + Hooks. (NO Redux, NO Zustand).
- **Icons:** FontAwesome (via `@fortawesome/react-fontawesome`).

## Banned Patterns

- ❌ **Tailwind:** Do not suggest Tailwind classes.
- ❌ **Fetch/Axios:** Do not make HTTP calls in components. Use the `data-access` package.
- ❌ **Raw SQL:** We use PouchDB (NoSQL).
