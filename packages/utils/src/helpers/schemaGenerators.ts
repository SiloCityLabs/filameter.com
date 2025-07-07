import type {
  Article,
  BreadcrumbList,
  ListItem,
  Organization,
  Person,
  WebSite,
  WebPage,
  ImageObject,
  WithContext,
  VideoObject,
  FAQPage,
  Question,
  Answer,
} from 'schema-dts';

// --- Organization Schema ---
interface GenerateOrganizationSchemaArgs {
  name: string;
  url: string;
  logoUrl?: string;
  sameAs?: string[]; // URLs to social media profiles or other relevant pages
  contactPoint?: Array<{
    '@type': 'ContactPoint';
    telephone?: string;
    contactType?: string;
    areaServed?: string;
    availableLanguage?: string[];
  }>;
}
export const generateOrganizationSchema = (
  args: GenerateOrganizationSchemaArgs
): WithContext<Organization> => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: args.name,
    url: args.url,
    logo: args.logoUrl ? ({ '@type': 'ImageObject', url: args.logoUrl } as ImageObject) : undefined,
    sameAs: args.sameAs,
    contactPoint: args.contactPoint,
  };
};

// --- WebSite Schema ---
interface GenerateWebSiteSchemaArgs {
  name: string;
  url: string;
  description?: string;
  publisher?: WithContext<Organization>; // Optional: Link to the publisher (Organization schema)
  potentialAction?: Array<{
    '@type': 'SearchAction';
    target: string | { '@type': 'EntryPoint'; urlTemplate: string };
    'query-input'?:
      | string
      | { '@type': 'PropertyValueSpecification'; valueRequired: boolean; valueName: string };
  }>;
}
export const generateWebSiteSchema = (args: GenerateWebSiteSchemaArgs): WithContext<WebSite> => {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: args.name,
    url: args.url,
    description: args.description,
    publisher: args.publisher,
    potentialAction: args.potentialAction,
  };
};

// --- WebPage Schema ---
interface GenerateWebPageSchemaArgs {
  name: string;
  url: string;
  description?: string;
  datePublished?: string; // ISO 8601 format
  dateModified?: string; // ISO 8601 format
  breadcrumb?: WithContext<BreadcrumbList>;
  isPartOf?: WithContext<WebSite>; // Reference to the website it belongs to
  primaryImageOfPage?: WithContext<ImageObject>;
  author?: WithContext<Person> | WithContext<Organization>;
  publisher?: WithContext<Organization>;
}
export const generateWebPageSchema = (args: GenerateWebPageSchemaArgs): WithContext<WebPage> => {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: args.name,
    url: args.url,
    description: args.description,
    datePublished: args.datePublished,
    dateModified: args.dateModified || args.datePublished,
    breadcrumb: args.breadcrumb,
    isPartOf: args.isPartOf,
    primaryImageOfPage: args.primaryImageOfPage,
    author: args.author,
    publisher: args.publisher,
  };
};

// --- Article Schema ---
interface GenerateArticleSchemaArgs {
  headline: string;
  url: string; // URL of the article page (mainEntityOfPage)
  imageUrl?: string | string[];
  datePublished: string; // ISO 8601 format
  dateModified?: string; // ISO 8601 format
  authorName?: string; // Simple author name
  author?: WithContext<Person> | Array<WithContext<Person>>; // Or full Person schema(s)
  publisherName: string;
  publisherLogoUrl?: string;
  description?: string;
  articleBody?: string;
  keywords?: string | string[];
}
export const generateArticleSchema = (args: GenerateArticleSchemaArgs): WithContext<Article> => {
  let authorSchema: WithContext<Person> | Array<WithContext<Person>> | undefined;
  if (args.author) {
    authorSchema = args.author;
  } else if (args.authorName) {
    authorSchema = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: args.authorName,
    } as WithContext<Person>; // Type assertion with full context
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: { '@type': 'WebPage', '@id': args.url },
    headline: args.headline,
    image: args.imageUrl,
    datePublished: args.datePublished,
    dateModified: args.dateModified || args.datePublished,
    author: authorSchema,
    publisher: {
      '@type': 'Organization',
      name: args.publisherName,
      logo: args.publisherLogoUrl
        ? ({ '@type': 'ImageObject', url: args.publisherLogoUrl } as ImageObject)
        : undefined,
    },
    description: args.description,
    articleBody: args.articleBody,
    keywords: args.keywords,
  };
};

// --- BreadcrumbList Schema ---
interface BreadcrumbListItem {
  position: number;
  name: string;
  item?: string; // URL for the breadcrumb item
}
export const generateBreadcrumbListSchema = (
  items: BreadcrumbListItem[]
): WithContext<BreadcrumbList> => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(
      (item) =>
        ({
          '@type': 'ListItem',
          position: item.position,
          name: item.name,
          item: item.item, // If item is undefined, it's the current page, not linked
        }) as ListItem
    ),
  };
};

// --- Person Schema ---
interface GeneratePersonSchemaArgs {
  name: string;
  url?: string; // URL to a profile page or about page for the person
  jobTitle?: string;
  image?: string; // URL to a profile picture
  sameAs?: string[]; // URLs to social media profiles
  alumniOf?: WithContext<Organization> | Array<WithContext<Organization>>;
  worksFor?: WithContext<Organization> | Array<WithContext<Organization>>;
}
export const generatePersonSchema = (args: GeneratePersonSchemaArgs): WithContext<Person> => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: args.name,
    url: args.url,
    jobTitle: args.jobTitle,
    image: args.image,
    sameAs: args.sameAs,
    alumniOf: args.alumniOf,
    worksFor: args.worksFor,
  };
};

// --- VideoObject Schema ---
interface GenerateVideoObjectSchemaArgs {
  name: string;
  description: string;
  thumbnailUrl: string | string[];
  uploadDate: string; // ISO 8601 format
  duration?: string; // ISO 8601 duration format (e.g., "PT1M33S")
  contentUrl?: string; // URL of the video file
  embedUrl?: string; // URL to embed the video player
  publisher?: WithContext<Organization>;
  expires?: string; // ISO 8601 format
  regionsAllowed?: string | string[];
}
export const generateVideoObjectSchema = (
  args: GenerateVideoObjectSchemaArgs
): WithContext<VideoObject> => {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: args.name,
    description: args.description,
    thumbnailUrl: args.thumbnailUrl,
    uploadDate: args.uploadDate,
    duration: args.duration,
    contentUrl: args.contentUrl,
    embedUrl: args.embedUrl,
    publisher: args.publisher,
    expires: args.expires,
    regionsAllowed: args.regionsAllowed,
  };
};

// --- FAQPage Schema ---
interface FaqQuestion {
  questionName: string;
  acceptedAnswerText: string;
}
export const generateFAQPageSchema = (
  questions: FaqQuestion[],
  mainEntityName?: string, // Optional name for the FAQPage itself
  mainEntityDescription?: string // Optional description for the FAQPage
): WithContext<FAQPage> => {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    name: mainEntityName,
    description: mainEntityDescription,
    mainEntity: questions.map(
      (q) =>
        ({
          '@type': 'Question',
          name: q.questionName,
          acceptedAnswer: { '@type': 'Answer', text: q.acceptedAnswerText },
        }) as Question
    ),
  };
};

// We can add more schema generators here as needed (e.g., Product, Event, Recipe, LocalBusiness etc.)
