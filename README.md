# FilaMeter - Filament Inventory Manager

Inspired by https://github.com/Donkie/Spoolman

This is a project to run a website, leveraging [Next.js](https://nextjs.org/), [React Bootstrap](https://react-bootstrap.netlify.app/) and hosted on GitHub Pages.

## Getting Started

To run the project locally:

```bash
git clone git@github.com:SiloCityLabs/SiloCityPages.git
cd SiloCityPages
```

```bash
npm install
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the website.

## Website Setup

- Copy .env.example and create .env.local and update values
- Update package.json
- Update manifest.json
- Update sitemap.xml
- Update GA_TRACKING_ID to implement Google Analytics

## Editing the Website

You can modify the main content of the site by editing the following files:

- app/pages.tsx: The main landing page of the website.

- app/layout.tsx: The layout file for shared elements like headers or footers.

The project auto-updates changes as you edit.

## Deployment

This website is hosted on GitHub Pages. To deploy updates create a PR, commit and push. When merged into master github actions will automatically build and deploy.

## Features

- **Optimized Performance**: Uses [next/font](https://nextjs.org/docs/basic-features/font-optimization) for automatic font optimization.

- **Modern Framework**: Built with the power of Next.js and React.
