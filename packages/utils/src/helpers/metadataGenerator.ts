// --- Next ---
import type { Metadata } from 'next';

// Interface for page-specific metadata options
interface PageMetadataOptions {
  title?: string;
  description?: string;
  keywords?: string[];
  includeIcons?: boolean;
}

// Interface for the application's base configuration
interface AppConfig {
  appName: string;
  appDesc: string;
  appKeywords: string[];
}

/**
 * Generates a Next.js Metadata object for a page. (Generic Engine)
 * This function is meant to be used by a project-specific wrapper.
 * @param {PageMetadataOptions} pageOptions - The dynamic metadata for the specific page.
 * @param {AppConfig} appConfig - The base configuration for the application.
 * @returns {Metadata} The generated metadata object.
 */
export const generatePageMetadata = (
  pageOptions: PageMetadataOptions,
  appConfig: AppConfig
): Metadata => {
  const { title, description, keywords, includeIcons = true } = pageOptions;
  const { appName, appDesc, appKeywords } = appConfig;

  const metadata: Metadata = {
    // If a specific title is provided, Next.js uses the root layout's template.
    // If no title is provided, it sets the default for the app.
    title: title ? title : { default: appName, template: `%s | ${appName}` },
    description: description || appDesc,
    keywords: keywords || appKeywords,
    manifest: '/manifest.json',
    appleWebApp: { title: appName, statusBarStyle: 'default', capable: true },
  };

  // Conditionally add the icons object to prevent 404 errors
  if (includeIcons) {
    metadata.icons = {
      icon: [
        { url: '/icon.png', type: 'image/png' },
        { url: '/icon.svg', type: 'image/svg+xml' },
        { url: '/icons/favicon-96x96.png', type: 'image/png', sizes: '96x96' },
      ],
      apple: { url: '/apple-icon.png', type: 'image/png' },
    };
  }

  return metadata;
};
