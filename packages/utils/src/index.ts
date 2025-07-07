// --- General Helpers ---
export { capitalizeFirstLetter } from './helpers/capitalizeFirstLetter';
export { generateGithubLink } from './helpers/generateGithubLink';
export { getLocalStorage, setLocalStorage } from './helpers/localStorage';
export { mergeObjectsWithRekey } from './helpers/mergeObjectsWithRekey';
export { randomListItem } from './helpers/randomListItem';

// --- Analytics Utils ---
export { sendEvent } from './analytics/gtag';

// --- SEO Components ---
export { default as StructuredData } from './components/StructuredData';

// --- SEO Helpers ---
export {
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateWebPageSchema,
  generateArticleSchema,
  generateBreadcrumbListSchema,
  generatePersonSchema,
  generateVideoObjectSchema,
  generateFAQPageSchema,
} from './helpers/schemaGenerators';
