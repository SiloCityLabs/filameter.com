// --- Next ---
import type { Metadata } from 'next';
// --- Utils ---
import { generatePageMetadata as generatePageMetadataGeneric } from '@silocitypages/utils';

// Read the app's environment variables ONCE in this file.
const appConfig = {
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'SiloCityPages',
  appDesc: process.env.NEXT_PUBLIC_APP_DESC || 'Default description',
  appKeywords: (process.env.NEXT_PUBLIC_APP_KEYWORDS || 'default').split(',').map((k) => k.trim()),
};

// Define a simpler type for page-specific options for this project
interface PageMetadataOptions {
  title?: string;
  description?: string;
  keywords?: string[];
  includeIcons?: boolean;
}

/**
 * Generates page metadata for this specific project with the app config pre-filled.
 * @param {PageMetadataOptions} [options={}] - The dynamic metadata for the specific page.
 * @returns {Metadata} The generated metadata object.
 */
export const generateMetadata = (options: PageMetadataOptions = {}): Metadata => {
  // Call the generic function with the project's pre-configured appConfig.
  return generatePageMetadataGeneric(options, appConfig);
};
