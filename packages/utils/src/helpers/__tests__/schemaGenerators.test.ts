import {
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateWebPageSchema,
  generateArticleSchema,
  generateBreadcrumbListSchema,
  generatePersonSchema,
  generateVideoObjectSchema,
  generateFAQPageSchema,
} from '../schemaGenerators';

// Import only the types actively used in type annotations or casts within this test file.
import type {
  Person,
  WithContext,
  Organization, // Used for casting and as a type for generated Organization objects
  Article, // Used as a type for generated Article objects
  ImageObject, // Used for casting and as a type for generated ImageObject objects
  BreadcrumbList,
  VideoObject,
  FAQPage,
} from 'schema-dts';

describe('Schema Generators', () => {
  const commonContext = 'https://schema.org';
  const fixedDatePublished = '2023-01-01T12:00:00Z';
  const fixedDateModified = '2023-01-02T15:30:00Z';

  describe('generateOrganizationSchema', () => {
    it('should generate a minimal Organization schema', () => {
      const args = { name: 'Test Corp', url: 'https://example.com' };
      const schema: WithContext<Organization> = generateOrganizationSchema(args); // Typed output
      expect(schema).toEqual({
        '@context': commonContext,
        '@type': 'Organization',
        name: 'Test Corp',
        url: 'https://example.com',
        logo: undefined,
        sameAs: undefined,
        contactPoint: undefined,
      });
    });

    it('should generate a full Organization schema', () => {
      const args = {
        name: 'Test Corp Full',
        url: 'https://example.com/full',
        logoUrl: 'https://example.com/logo.png',
        sameAs: ['https://twitter.com/testcorp', 'https://linkedin.com/company/testcorp'],
        contactPoint: [
          {
            '@type': 'ContactPoint' as const,
            telephone: '+1-800-555-1212',
            contactType: 'customer service',
            areaServed: 'US',
            availableLanguage: ['English', 'Spanish'],
          },
        ],
      };
      const schema: WithContext<Organization> = generateOrganizationSchema(args); // Typed output
      expect(schema).toEqual({
        '@context': commonContext,
        '@type': 'Organization',
        name: 'Test Corp Full',
        url: 'https://example.com/full',
        logo: { '@type': 'ImageObject', url: 'https://example.com/logo.png' },
        sameAs: ['https://twitter.com/testcorp', 'https://linkedin.com/company/testcorp'],
        contactPoint: [
          {
            '@type': 'ContactPoint',
            telephone: '+1-800-555-1212',
            contactType: 'customer service',
            areaServed: 'US',
            availableLanguage: ['English', 'Spanish'],
          },
        ],
      });
    });
  });

  describe('generateWebSiteSchema', () => {
    it('should generate a minimal WebSite schema', () => {
      const args = { name: 'My Site', url: 'https://mysite.com' };
      // const schema: WithContext<WebSite> = generateWebSiteSchema(args); // WebSite type can be added if used
      const schema = generateWebSiteSchema(args);
      expect(schema).toEqual({
        '@context': commonContext,
        '@type': 'WebSite',
        name: 'My Site',
        url: 'https://mysite.com',
        description: undefined,
        publisher: undefined,
        potentialAction: undefined,
      });
    });

    it('should generate a WebSite schema with search action and publisher', () => {
      const publisherOrgArgs = { name: 'PubCo', url: 'https://pubco.com' };
      const publisherOrg: WithContext<Organization> = generateOrganizationSchema(publisherOrgArgs);

      const args = {
        name: 'My Searchable Site',
        url: 'https://search.mysite.com',
        description: 'A site with a search.',
        publisher: publisherOrg,
        potentialAction: [
          {
            '@type': 'SearchAction' as const,
            target: 'https://search.mysite.com/search?q={search_term_string}',
            'query-input': 'required name=search_term_string' as const,
          },
        ],
      };
      // const schema: WithContext<WebSite> = generateWebSiteSchema(args); // WebSite type can be added if used
      const schema = generateWebSiteSchema(args);
      expect(schema).toEqual({
        '@context': commonContext,
        '@type': 'WebSite',
        name: 'My Searchable Site',
        url: 'https://search.mysite.com',
        description: 'A site with a search.',
        publisher: publisherOrg,
        potentialAction: [
          {
            '@type': 'SearchAction',
            target: 'https://search.mysite.com/search?q={search_term_string}',
            'query-input': 'required name=search_term_string',
          },
        ],
      });
    });
  });

  describe('generateWebPageSchema', () => {
    it('should generate a minimal WebPage schema', () => {
      const args = { name: 'My Page', url: 'https://example.com/my-page' };
      // const schema: WithContext<WebPage> = generateWebPageSchema(args); // WebPage type can be added if used
      const schema = generateWebPageSchema(args);
      expect(schema).toEqual({
        '@context': commonContext,
        '@type': 'WebPage',
        name: 'My Page',
        url: 'https://example.com/my-page',
        description: undefined,
        datePublished: undefined,
        dateModified: undefined,
        breadcrumb: undefined,
        isPartOf: undefined,
        primaryImageOfPage: undefined,
        author: undefined,
        publisher: undefined,
      });
    });

    it('should use datePublished for dateModified if dateModified is not provided', () => {
      const args = {
        name: 'My Page',
        url: 'https://example.com/my-page',
        datePublished: fixedDatePublished,
      };
      const schema = generateWebPageSchema(args);
      expect(schema.dateModified).toBe(fixedDatePublished);
    });

    it('should include breadcrumbs and publisher', () => {
      const websiteSchemaArgs = { name: 'Example Site', url: 'https://example.com' };
      const websiteSchema = generateWebSiteSchema(websiteSchemaArgs);

      const publisherSchemaArgs = { name: 'Example Org', url: 'https://example.org' };
      const publisherSchema: WithContext<Organization> =
        generateOrganizationSchema(publisherSchemaArgs);

      const breadcrumbSchema: WithContext<BreadcrumbList> = generateBreadcrumbListSchema([
        // Typed output
        { position: 1, name: 'Home', item: 'https://example.com' },
        { position: 2, name: 'My Page' },
      ]);

      const args = {
        name: 'My Page Detailed',
        url: 'https://example.com/my-page-detailed',
        datePublished: fixedDatePublished,
        isPartOf: websiteSchema,
        publisher: publisherSchema,
        breadcrumb: breadcrumbSchema,
      };
      // const schema: WithContext<WebPage> = generateWebPageSchema(args); // WebPage type can be added if used
      const schema = generateWebPageSchema(args);
      expect(schema.isPartOf).toEqual(websiteSchema);
      expect(schema.publisher).toEqual(publisherSchema);
      expect(schema.breadcrumb).toEqual(breadcrumbSchema);
    });
  });

  describe('generateArticleSchema', () => {
    it('should generate an Article schema with minimal required fields and authorName', () => {
      const args = {
        headline: 'Test Article',
        url: 'https://example.com/article/test',
        datePublished: fixedDatePublished,
        authorName: 'John Doe',
        publisherName: 'Test Publisher',
      };
      const schema: WithContext<Article> = generateArticleSchema(args); // Typed output
      expect(schema).toEqual({
        '@context': commonContext,
        '@type': 'Article',
        mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://example.com/article/test' },
        headline: 'Test Article',
        datePublished: fixedDatePublished,
        dateModified: fixedDatePublished,
        author: { '@context': commonContext, '@type': 'Person', name: 'John Doe' },
        publisher: { '@type': 'Organization', name: 'Test Publisher', logo: undefined },
        image: undefined,
        description: undefined,
        articleBody: undefined,
        keywords: undefined,
      });
    });

    it('should use full author schema if provided, and handle publisher details correctly', () => {
      const authorObject: WithContext<Person> = {
        '@context': commonContext,
        '@type': 'Person',
        name: 'Jane Smith',
        url: 'https://example.com/jane-smith',
      };

      const args = {
        headline: 'Another Article',
        url: 'https://example.com/article/another',
        datePublished: fixedDatePublished,
        author: authorObject,
        publisherName: 'Awesome Books Inc.',
        publisherLogoUrl: 'https://example.com/logo.png',
        imageUrl: 'https://example.com/image.jpg',
        description: 'A great article.',
        articleBody: 'Some interesting content.',
        keywords: ['test', 'schema'],
        dateModified: fixedDateModified,
      };

      const schema: WithContext<Article> = generateArticleSchema(args);

      expect(schema.author).toEqual(authorObject);

      expect(schema.publisher).toBeDefined();
      if (
        schema.publisher &&
        typeof schema.publisher === 'object' &&
        schema.publisher['@type'] === 'Organization'
      ) {
        // Define an expected structure for type safety during testing
        type ExpectedOrg = {
          '@type': 'Organization';
          name?: string | string[];
          logo?: ImageObject | string | (ImageObject | string)[];
        };
        const publisherObject = schema.publisher as ExpectedOrg;

        expect(publisherObject.name).toEqual('Awesome Books Inc.');

        expect(publisherObject.logo).toBeDefined();
        const logoValue = publisherObject.logo;

        if (
          logoValue &&
          typeof logoValue === 'object' &&
          !Array.isArray(logoValue) &&
          logoValue['@type'] === 'ImageObject'
        ) {
          const logoAsSchemaImageObject = logoValue as ImageObject; // Cast to schema-dts ImageObject
          expect(logoAsSchemaImageObject.url).toEqual('https://example.com/logo.png');
        } else {
          fail('Publisher logo was not a recognized single ImageObject as expected.');
        }
      } else {
        fail('Publisher was not defined or not a recognized Organization object as expected.');
      }

      expect(schema.dateModified).toBe(fixedDateModified);
      expect(schema.image).toBe('https://example.com/image.jpg');
      expect(schema.description).toBe('A great article.');
      expect(schema.articleBody).toBe('Some interesting content.');
      expect(schema.keywords).toEqual(['test', 'schema']);
    });

    it('should handle array of image URLs for Article', () => {
      const args = {
        headline: 'Article With Multiple Images',
        url: 'https://example.com/article/multi-image',
        datePublished: fixedDatePublished,
        authorName: 'Multi Img Author',
        publisherName: 'Image Central',
        imageUrl: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
      };
      const schema: WithContext<Article> = generateArticleSchema(args); // Typed output
      expect(schema.image).toEqual([
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg',
      ]);
    });
  });

  describe('generateBreadcrumbListSchema', () => {
    it('should generate a BreadcrumbList schema', () => {
      const items = [
        { position: 1, name: 'Home', item: 'https://example.com/' },
        { position: 2, name: 'Category', item: 'https://example.com/category/' },
        { position: 3, name: 'Current Page' },
      ];
      const schema: WithContext<BreadcrumbList> = generateBreadcrumbListSchema(items);
      expect(schema).toEqual({
        '@context': commonContext,
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://example.com/' },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Category',
            item: 'https://example.com/category/',
          },
          { '@type': 'ListItem', position: 3, name: 'Current Page', item: undefined },
        ],
      });
    });

    it('should handle an empty list of items for BreadcrumbList', () => {
      const schema = generateBreadcrumbListSchema([]);
      expect(schema.itemListElement).toEqual([]);
    });
  });

  describe('generatePersonSchema', () => {
    it('should generate a minimal Person schema', () => {
      const args = { name: 'Alice Wonderland' };
      const schema: WithContext<Person> = generatePersonSchema(args); // Typed output
      expect(schema).toEqual({
        '@context': commonContext,
        '@type': 'Person',
        name: 'Alice Wonderland',
        url: undefined,
        jobTitle: undefined,
        image: undefined,
        sameAs: undefined,
        alumniOf: undefined,
        worksFor: undefined,
      });
    });

    it('should generate a full Person schema', () => {
      const worksForOrgArgs = { name: 'Wonderland Inc.', url: 'https://wonderland.inc' };
      const worksForOrg: WithContext<Organization> = generateOrganizationSchema(worksForOrgArgs);

      const args = {
        name: 'Bob The Builder',
        url: 'https://example.com/bob',
        jobTitle: 'Chief Constructor',
        image: 'https://example.com/bob.jpg',
        sameAs: ['https://twitter.com/bobthebuilder'],
        worksFor: worksForOrg,
      };
      const schema: WithContext<Person> = generatePersonSchema(args); // Typed output
      expect(schema).toEqual({
        '@context': commonContext,
        '@type': 'Person',
        name: 'Bob The Builder',
        url: 'https://example.com/bob',
        jobTitle: 'Chief Constructor',
        image: 'https://example.com/bob.jpg',
        sameAs: ['https://twitter.com/bobthebuilder'],
        worksFor: worksForOrg,
        alumniOf: undefined,
      });
    });
  });

  describe('generateVideoObjectSchema', () => {
    it('should generate a minimal VideoObject schema', () => {
      const args = {
        name: 'My Awesome Video',
        description: 'A video about things.',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        uploadDate: fixedDatePublished,
      };
      const schema: WithContext<VideoObject> = generateVideoObjectSchema(args); // Typed output
      expect(schema).toEqual({
        '@context': commonContext,
        '@type': 'VideoObject',
        name: 'My Awesome Video',
        description: 'A video about things.',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        uploadDate: fixedDatePublished,
        duration: undefined,
        contentUrl: undefined,
        embedUrl: undefined,
        publisher: undefined,
        expires: undefined,
        regionsAllowed: undefined,
      });
    });

    it('should generate a full VideoObject schema', () => {
      const publisherOrgArgs = { name: 'Video Makers', url: 'https://videomakers.com' };
      const publisherOrg: WithContext<Organization> = generateOrganizationSchema(publisherOrgArgs);

      const args = {
        name: 'Full Video Details',
        description: 'This video has everything.',
        thumbnailUrl: ['https://example.com/thumb1.jpg', 'https://example.com/thumb2.jpg'],
        uploadDate: fixedDatePublished,
        duration: 'PT2M30S',
        contentUrl: 'https://example.com/video.mp4',
        embedUrl: 'https://example.com/embed/video',
        publisher: publisherOrg,
        expires: '2025-12-31T23:59:59Z',
        regionsAllowed: 'US, CA',
      };
      const schema: WithContext<VideoObject> = generateVideoObjectSchema(args);
      expect(schema).toEqual({
        '@context': commonContext,
        '@type': 'VideoObject',
        name: 'Full Video Details',
        description: 'This video has everything.',
        thumbnailUrl: ['https://example.com/thumb1.jpg', 'https://example.com/thumb2.jpg'],
        uploadDate: fixedDatePublished,
        duration: 'PT2M30S',
        contentUrl: 'https://example.com/video.mp4',
        embedUrl: 'https://example.com/embed/video',
        publisher: publisherOrg,
        expires: '2025-12-31T23:59:59Z',
        regionsAllowed: 'US, CA',
      });
    });
  });

  describe('generateFAQPageSchema', () => {
    it('should generate an FAQPage schema with name and description', () => {
      const questions = [
        { questionName: 'What is foo?', acceptedAnswerText: 'Foo is a metasyntactic variable.' },
        { questionName: 'How to bar?', acceptedAnswerText: 'You bar by baz-ing.' },
      ];
      const schema: WithContext<FAQPage> = generateFAQPageSchema(
        questions,
        'My FAQ',
        'Frequently asked questions about my product.'
      );
      expect(schema).toEqual({
        '@context': commonContext,
        '@type': 'FAQPage',
        name: 'My FAQ',
        description: 'Frequently asked questions about my product.',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'What is foo?',
            acceptedAnswer: { '@type': 'Answer', text: 'Foo is a metasyntactic variable.' },
          },
          {
            '@type': 'Question',
            name: 'How to bar?',
            acceptedAnswer: { '@type': 'Answer', text: 'You bar by baz-ing.' },
          },
        ],
      });
    });

    it('should generate an FAQPage schema without optional name and description', () => {
      const questions = [
        { questionName: 'Minimal Question?', acceptedAnswerText: 'Minimal Answer.' },
      ];
      const schema = generateFAQPageSchema(questions);
      expect(schema.name).toBeUndefined();
      expect(schema.description).toBeUndefined();
      expect(schema.mainEntity).toHaveLength(1);

      const mainEntityArray = schema.mainEntity;
      if (
        Array.isArray(mainEntityArray) &&
        mainEntityArray.length > 0 &&
        mainEntityArray[0] &&
        typeof mainEntityArray[0] === 'object' &&
        mainEntityArray[0]['@type'] === 'Question'
      ) {
        // mainEntityArray[0] is now known to be a Question object
        expect(mainEntityArray[0].name).toEqual('Minimal Question?');
      } else {
        fail('mainEntity was not structured as expected for Question name check.');
      }
    });
  });
});
