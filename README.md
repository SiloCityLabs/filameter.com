# SiloCityPages

[![CI](https://github.com/SiloCityLabs/SiloCityPages/actions/workflows/ci.yml/badge.svg)](https://github.com/SiloCityLabs/SiloCityPages/actions/workflows/ci.yml)
[![Deploy to GitHub Pages](https://github.com/SiloCityLabs/SiloCityPages/actions/workflows/nextjs.yml/badge.svg)](https://github.com/SiloCityLabs/SiloCityPages/actions/workflows/nextjs.yml)
[![Prettier Check](https://github.com/SiloCityLabs/SiloCityPages/actions/workflows/prettier-check.yml/badge.svg)](https://github.com/SiloCityLabs/SiloCityPages/actions/workflows/prettier-check.yml)

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-orange.svg)](https://creativecommons.org/licenses/by-sa/4.0/)
[![pnpm](https://img.shields.io/badge/pnpm-10.10.0-blue.svg)](https://pnpm.io/)
[![Next.js](https://img.shields.io/badge/Next.js-^15.3.1-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-^19.0.0-blue?logo=react)](https://react.dev/)

Welcome to SiloCityPages, a modern and efficient website framework built using Next.js, React Bootstrap, and TypeScript, designed for optimal performance and easy maintainability. This project leverages the power of GitHub Pages for seamless deployment and hosting. It also uses JSON files to hold project metadata and custom components to keep the project organized.

This repository is structured as a monorepo containing the main application shell and core reusable components/utilities in separate packages.

## Table of Contents

1.  [Getting Started](#getting-started)
2.  [Website Setup](#website-setup)
3.  [Configuration Deep Dive](#configuration-deep-dive)
4.  [Monorepo Structure](#monorepo-structure)
5.  [Linting Configuration (Important for Forks)](#linting-configuration-important-for-forks)
6.  [Editing the Website](#editing-the-website)
7.  [Testing](#testing)
8.  [Deployment](#deployment)
9.  [Features](#features)
10. [Contributing](#contributing)
11. [License](#license)
12. [Support](#support)

## Getting Started

To get started with the SiloCityPages project and run it locally, follow these steps:

1.  **Fork and Clone the Repository:**

    Fork the `SiloCityLabs/SiloCityPages` repository on GitHub. Then, clone your forked repository to your local machine:

    ```bash
    git clone git@github.com:YOUR_GITHUB_USERNAME/SiloCityPages.git
    cd SiloCityPages
    ```

    Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username.

2.  **Install pnpm:**

    This project uses pnpm as its package manager, which is recommended for monorepos. If you don't have pnpm installed globally, you can install it using npm:

    ```bash
    npm install -g pnpm
    ```

3.  **Install Dependencies:**

    Navigate to the root of the cloned repository and install all project and package dependencies using pnpm:

    ```bash
    pnpm install
    ```

4.  **Run the Development Server:**

    Start the Next.js development server:

    ```bash
    pnpm run dev:turbo
    ```

5.  **Build one package**

    Replace `<package-name>` with the package you would like to build (e.g., `ui-core`, `utils`).

    ```bash
    pnpm --filter=@silocitypages/<package-name> run build
    ```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the website.

## Website Setup

Before diving deep, ensure your environment is correctly set up:

- **Environment Variables**: Copy `.env.example` to `.env.local` and update the necessary values. This file is for local environment variables like API keys or your Google Analytics ID. For example, `NEXT_PUBLIC_GA_TRACKING_ID` is used for Google Analytics.
- **`package.json`**: Review and update the root `package.json` with your project's specific details (name, author, repository URL, etc.).
- **Public Assets & SEO**:
  - `public/manifest.json`: Update the Web App Manifest with your site's name, short name, icons, and theme colors. This is crucial for PWA behavior.
  - `sitemap.xml`: is automatically generated. (See `next-sitemap.config.js`)
  - `robots.txt`: : is automatically generated. (See `next-sitemap.config.js`)
- **Code Style**: Update `.prettierrc.mjs` if you have specific code style preferences that differ from the project's defaults.
- **Linting**: Review the [Linting Configuration](#linting-configuration-important-for-forks) section, especially if you are forking this repository.
- **AI Agents (`AGENTS.md`)**: This framework uses `AGENTS.md` to guide AI coding assistants. When forking, copy the template from `docs/AGENTS_TEMPLATE.md` to a new file named `AGENTS.md` in the project root. **Update** the "Project Purpose" section in this new file to describe your specific application (e.g., "A 3D Filament Inventory System"). Do _not_ modify the nested `AGENTS.md` files inside the `packages/` directory, as they contain critical framework rules.
- **PNPM Workspace Configuration (`.npmrc`)**: This project uses PNPM workspaces and primarily manages dependencies at the workspace root. To allow adding new dependencies directly to the root `package.json` using `pnpm add <package-name>` (without requiring the `-w` flag or seeing default PNPM warnings), you need to configure PNPM:
  - **Create the file**: In the project's root directory (the same location as this README and the root `package.json`), create a file named `.npmrc` if one doesn't already exist.
  - **Add the configuration**: Open the `.npmrc` file and add the following line:
    ```
    ignore-workspace-root-check=true
    ```
  - This setting tells PNPM to bypass the check that normally discourages adding dependencies directly to the workspace root, aligning PNPM's behavior with this project's dependency management approach.

## Configuration Deep Dive

Understanding the key configuration files will help you tailor SiloCityPages to your needs:

- **`next.config.mjs`**: This is the main configuration file for Next.js. Here you can customize settings related to:
  - **Output Mode**: Configured for `export` for static site generation compatible with GitHub Pages.
  - **Image Optimization**: Settings for `next/image`.
  - **Environment Variables**: Public environment variables are prefixed with `NEXT_PUBLIC_`.
  - **Webpack Customization**: Advanced options to modify the webpack build process if needed.
- **`.env.local`**: Used for defining environment variables for your local development. Values here override those in `.env.example` and are not committed to Git. Ensure sensitive keys are stored securely.
- **`tsconfig.json`**: TypeScript compiler options for the project. It defines how TypeScript files are transpiled into JavaScript, including target ECMAScript version, module system, JSX processing, and path aliases.
- **`public/manifest.json`**: Defines your Progressive Web App (PWA) settings. It allows users to add your website to their home screen, and specifies icons, theme colors, and display mode.
- **`out/sitemap.xml`**: It's automatically generated during the build process by the next-sitemap package. Configuration for these can be found in `next-sitemap.config.js`. These files provide a map of your site's pages to search engines and control crawler access, which is essential for SEO.
- **`next-sitemap.config.js`**: This file configures the next-sitemap package, which automatically generates sitemap.xml and robots.txt files during the build process. You can customize options such as your site's URL, which paths to include or exclude, and robots.txt rules here.

## Monorepo Structure

This repository is organized as a monorepo using pnpm workspaces, defined in `pnpm-workspace.yaml`.

- The root directory ( `/` ) contains the main Next.js application shell and global configuration files (`package.json`, `next.config.mjs`, `.eslintrc.mjs`, etc.).
- The `packages/` directory contains reusable code divided into separate pnpm packages:
  - **`@silocitypages/ui-core`**: Contains core reusable UI components (e.g., `CustomAlert`, `SclCard`, `SclFooter`), custom hooks, and associated styles (including CSS Modules like `SclBadges.module.css`). This package helps maintain a consistent look and feel across the application.
  - **`@silocitypages/utils`**: Provides shared utility functions that can be used across the application and other packages. Examples include `capitalizeFirstLetter`, `generateGithubLink`, and analytics helpers for `gtag.js`.
  - **`@silocitypages/data-access`**: Manages data operations, currently set up for PouchDB for client-side storage. It includes functions for saving, retrieving, and deleting documents.
  - **`@silocitypages/eslint-config`**: A shareable ESLint configuration used across the monorepo to enforce consistent code style and quality.

When you run `pnpm install` from the root, pnpm links these local packages together and installs their dependencies alongside the root project's dependencies.

## Linting Configuration (Important for Forks)

This repository includes an ESLint configuration file (`.eslintrc.mjs`) at the root. This configuration extends the shared rules defined in the `@silocitypages/eslint-config` package and is used to lint the code in the root application shell and the source code within the `packages/` directory when working in the monorepo base.

When you fork this repository to start a new project, the `packages/` directory containing the framework source code will be part of your working copy, not installed into `node_modules`. By default, your linter will try to process the code within this `packages/` directory, which is usually not desired in a forked project.

To prevent your linter from processing the framework code in the `packages/` directory, it is **highly recommended** to explicitly ignore the `packages/` directory in your linting configuration in your forked project.

The simplest way to do this is by creating or updating a `.eslintignore` file at the root of your forked project and adding the following line:

```bash
# Ignore the packages directory containing framework source code
packages/
```

Alternatively, you can uncomment `"packages/"` in the ignorePatterns array directly in your `.eslintrc.cjs` file.

Choose one of these methods to ensure your linter focuses only on the application-specific code you write in your forked project.

## Editing the Website

You can modify the main content and application-specific logic of your site by editing the files in the root application structure (e.g., files in the `pages/` directory, root components).

Core reusable components and utilities are located within the `packages/` directory. You should generally only modify code within `packages/` if you intend to contribute changes back to the base framework or customize the framework itself.

The project auto-updates changes as you edit when running `pnpm run dev:turbo`.

## Testing

This project uses Jest for unit and integration testing. Test files are typically located in `__tests__` directories within the packages or root `src` folder.

- Run all tests:
  ```bash
  pnpm run test
  ```
- Run all package specific tests:
  ```bash
  pnpm run test packages/<package-name>
  ```
- Run tests in watch mode:
  ```bash
  pnpm run test:watch
  ```
- Generate test coverage report:
  ```bash
  pnpm run test:coverage
  ```
  The coverage report will be available in the coverage/ directory.

Configuration for Jest can be found in `jest.config.ts`.

### Ignoring Packages in Forks:

If you have forked this repository and want to prevent Jest from running tests within the original `packages/` directory, you can modify the `jest.config.ts` file. Add `'<rootDir>/packages/'` to the testPathIgnorePatterns array like so:

```typescript
// jest.config.ts
import type { Config } from 'jest';

const config: Config = {
  // ... other config
  // Add '<rootDir>/packages/' to this array
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '<rootDir>/packages/'],
  // Add '<rootDir>/packages/' to this array
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/', '<rootDir>/packages/'],
  // ... other config
};

export default config;
```

## Deployment

This website is hosted on GitHub Pages. To deploy updates, create a pull request with your changes. When merged into the `main` branch, GitHub Actions will automatically build and deploy the site using the workflow defined in `.github/workflows/nextjs.yml`. This workflow handles installing dependencies, building the Next.js application (using `next build` and `next export`), and deploying the static output to the `gh-pages` branch.

## Features

- **Optimized Performance**: Uses [next/font](https://nextjs.org/docs/basic-features/font-optimization) for automatic font optimization.
- **Modern Framework**: Built with the power of Next.js and React.
- **Monorepo Structure**: Organizes code into reusable packages using pnpm workspaces for better modularity and maintainability.
- **Consistent Styling**: Leverages React Bootstrap and custom components for a unified look and feel.
  - Leverages React Bootstrap for a base set of UI components.
  - Employs custom components within `@silocitypages/ui-core`.
  - Utilizes CSS Modules (e.g., `SclBadges.module.css`) for component-scoped styles, preventing global style conflicts.
- **TypeScript Integration**: Full TypeScript support for strong typing and improved developer experience.
- **Client-Side Data Management**: Includes a `@silocitypages/data-access` package with PouchDB integration for local data persistence.
- **Utility Suite**: Offers a collection of common utilities in `@silocitypages/utils` for tasks like string manipulation and analytics.
- **SEO Friendly**: Setup includes `sitemap.xml` and `robots.txt`, with support for metadata customization.
- **Automated Workflows**: GitHub Actions for CI (linting, testing, building) and deployment.

## Contributing

Contributions are welcome! Whether it's bug fixes, feature enhancements, or documentation improvements, please feel free to contribute.

1. Fork the repository.
2. **Create a new branch** for your feature or bug fix: `git checkout -b feature/your-feature-name` or `bugfix/issue-number`.
3. Make your changes.
4. Ensure your code lints and tests pass:
   - `pnpm run lint`
   - `pnpm run test`
5. **Commit your changes** with a clear and descriptive commit message.
6. **Push your branch** to your forked repository.
7. **Open a Pull Request** to the `monorepo` branch of the `SiloCityLabs/SiloCityPages` repository.

Our CI pipeline (`.github/workflows/ci.yml`) will run checks for linting, formatting (Prettier via `prettier-check.yml`), and tests. Please ensure these pass before requesting a review.

## License

This project is licensed under the **Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0) License**.

- You are free to:
  - **Share** — copy and redistribute the material in any medium or format
  - **Adapt** — remix, transform, and build upon the material for any purpose, even commercially.

- Under the following terms:
  - **Attribution** — You must give appropriate credit, provide a link to the license, and indicate if changes were made. You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use.
  - **ShareAlike** — If you remix, transform, or build upon the material, you must distribute your contributions under the same license as the original.

See the [LICENSE](./LICENSE) file and the [Creative Commons website](https://creativecommons.org/licenses/by-sa/4.0/) for more details.

## Support

If you encounter any issues or have questions, please file an issue on the [GitHub Issues page](https://github.com/SiloCityLabs/SiloCityPages/issues).

---

This project is a collaborative effort by [OneBuffaloLabs](https://onebuffalolabs.com) and [SiloCityLabs](https://silocitylabs.com).
