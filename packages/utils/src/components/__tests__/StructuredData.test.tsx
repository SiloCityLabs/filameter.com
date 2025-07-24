import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import type { WebSite, WithContext, Organization } from 'schema-dts';

// NOTE: The component itself is now imported dynamically inside each test
// to ensure it loads with the correct NODE_ENV.

describe('StructuredData Component', () => {
  // --- Mock Data ---
  const mockWebSiteData: WithContext<WebSite> = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Test Site',
    url: 'https://example.com',
  };

  const mockOrganizationData: WithContext<Organization> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Test Org',
    url: 'https://org.example.com',
    logo: 'https://org.example.com/logo.png',
  };

  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    // Restore original environment and reset module cache
    (process.env.NODE_ENV as string | undefined) = originalNodeEnv;
    jest.resetModules();
    jest.restoreAllMocks();
  });

  // --- Environment-Independent Tests ---
  describe('in any environment', () => {
    it('should render a script tag with correct type and content', async () => {
      const { default: StructuredData } = await import('../StructuredData');
      render(<StructuredData data={mockWebSiteData} />);
      const scriptTag = screen.getByTestId('structured-data');
      expect(scriptTag).toBeInTheDocument();
      expect(scriptTag.tagName).toBe('SCRIPT');
      expect(scriptTag).toHaveAttribute('type', 'application/ld+json');
      expect(scriptTag.innerHTML).toBe(JSON.stringify(mockWebSiteData));
    });

    it('should render with a given id and include it in data-testid', async () => {
      const { default: StructuredData } = await import('../StructuredData');
      const testId = 'my-custom-website-schema';
      render(<StructuredData data={mockWebSiteData} id={testId} />);
      const scriptTag = screen.getByTestId(`structured-data-${testId}`);
      expect(scriptTag).toBeInTheDocument();
      expect(scriptTag).toHaveAttribute('id', testId);
    });

    it('should return null if no data is provided', async () => {
      const { default: StructuredData } = await import('../StructuredData');
      // @ts-expect-error Testing invalid prop for null case
      const { container } = render(<StructuredData data={null} />);
      expect(container.firstChild).toBeNull();
    });
  });

  // --- Development-Specific Tests ---
  describe('in a development environment', () => {
    beforeEach(() => {
      (process.env.NODE_ENV as string | undefined) = 'development';
    });

    it('should warn if data is missing "@context"', async () => {
      const { default: StructuredData } = await import('../StructuredData');
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const dataWithoutContext = { '@type': 'WebSite', name: 'No Context' } as any;
      render(<StructuredData data={dataWithoutContext} />);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'StructuredData component: Missing "@context" in data. Schema will likely be invalid.',
        dataWithoutContext
      );
    });

    it('should log an error if JSON.stringify fails', async () => {
      const { default: StructuredData } = await import('../StructuredData');
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const circularData: any = { '@context': 'https://schema.org' };
      circularData.self = circularData; // Create circular reference
      const { container } = render(<StructuredData data={circularData} />);
      expect(container.firstChild).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'StructuredData component: Error stringifying JSON-LD data.',
        expect.any(Error),
        circularData
      );
    });
  });

  // --- Production-Specific Tests ---
  describe('in a production environment', () => {
    beforeEach(() => {
      (process.env.NODE_ENV as string | undefined) = 'production';
    });

    it('should not warn if data is missing "@context"', async () => {
      const { default: StructuredData } = await import('../StructuredData');
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const dataWithoutContext = { '@type': 'WebSite', name: 'No Context' } as any;
      render(<StructuredData data={dataWithoutContext} />);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should not log an error if JSON.stringify fails', async () => {
      const { default: StructuredData } = await import('../StructuredData');
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const circularData: any = { '@context': 'https://schema.org' };
      circularData.self = circularData;
      const { container } = render(<StructuredData data={circularData} />);
      expect(container.firstChild).toBeNull();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });
});
