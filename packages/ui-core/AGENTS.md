# UI Core Agent Instructions

## Scope

Shared React components used across the FilaMeter application.

## Design System

- **Base Framework:** React Bootstrap
- **Styling:** CSS Modules (`*.module.css`)
- **Icons:** FontAwesome (`@fortawesome/react-fontawesome`)

## Component Rules

1. **Functional Components:** Use `const Component = (props: Props) => { ... }`.
2. **Props:** All props must be explicitly typed via TypeScript interfaces.
3. **No Database Calls:** UI components must remain pure. Data is passed in via props, never fetched directly inside these components.
4. **Bootstrap usage:** Prefer `<Container>`, `<Row>`, `<Col>` over `<div>` for layout.

## File Patterns

- Component: `src/components/MyComponent.tsx`
- Styles: `src/styles/components/MyComponent.module.css`
- Tests: `src/components/__tests__/MyComponent.test.tsx`
