import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import StructuredData from '../StructuredData';
import type { WebSite, WithContext, Organization } from 'schema-dts';

describe('StructuredData Component', () => {
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

  // Helper to manage NODE_ENV for a single test
  const withMockedNodeEnv = (
    nodeEnv: 'development' | 'production' | 'test',
    testFn: () => void
  ) => {
    const originalNodeEnv = process.env.NODE_ENV;
    try {
      process.env.NODE_ENV = nodeEnv;
      testFn();
    } finally {
      process.env.NODE_ENV = originalNodeEnv;
    }
  };

  it('should warn if data is missing "@context" in development', () => {
    withMockedNodeEnv('development', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const dataWithoutContext = {
        '@type': 'WebSite',
        name: 'No Context Site',
      } as unknown as WithContext<WebSite>;
      render(<StructuredData data={dataWithoutContext} />);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'StructuredData component: Missing "@context" in data. Schema will likely be invalid.',
        dataWithoutContext
      );
      consoleWarnSpy.mockRestore();
    });
  });

  it('should not warn if data is missing "@context" in production', () => {
    withMockedNodeEnv('production', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const dataWithoutContext = {
        '@type': 'WebSite',
        name: 'No Context Site Prod',
      } as unknown as WithContext<WebSite>;
      render(<StructuredData data={dataWithoutContext} />);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });
  });

  it('should return null and log an error if JSON.stringify fails in development', () => {
    withMockedNodeEnv('development', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const circularData: any = { '@context': 'https://schema.org', name: 'Circular' };
      circularData.self = circularData;
      const { container } = render(<StructuredData data={circularData as WithContext<WebSite>} />);
      expect(container.firstChild).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'StructuredData component: Error stringifying JSON-LD data.',
        expect.any(Error),
        circularData
      );
      consoleErrorSpy.mockRestore();
    });
  });

  it('should return null and not log an error if JSON.stringify fails in production', () => {
    withMockedNodeEnv('production', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const circularData: any = { '@context': 'https://schema.org', name: 'Circular Prod' };
      circularData.self = circularData;
      const { container } = render(<StructuredData data={circularData as WithContext<WebSite>} />);
      expect(container.firstChild).toBeNull();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  it('should render correctly even if "@context" is missing (though it warns in dev)', () => {
    withMockedNodeEnv('development', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const dataWithoutContext = {
        '@type': 'WebSite',
        name: 'No Context Site But Render',
        url: 'https://nocontext.example.com',
      } as unknown as WithContext<WebSite>;
      render(<StructuredData data={dataWithoutContext} id='no-context-render' />);
      const scriptTag = screen.getByTestId('structured-data-no-context-render');
      expect(scriptTag).toBeInTheDocument();
      expect(scriptTag.innerHTML).toBe(JSON.stringify(dataWithoutContext));
      expect(consoleWarnSpy).toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });
  });

  // Tests that DO NOT depend on NODE_ENV
  it('should render a script tag with correct type and content', () => {
    withMockedNodeEnv('test', () => {
      render(<StructuredData data={mockWebSiteData} />);
      const scriptTag = screen.getByTestId('structured-data');
      expect(scriptTag).toBeInTheDocument();
      expect(scriptTag.tagName).toBe('SCRIPT');
      expect(scriptTag).toHaveAttribute('type', 'application/ld+json');
      expect(scriptTag.innerHTML).toBe(JSON.stringify(mockWebSiteData));
    });
  });

  it('should render with a given id and include it in data-testid', () => {
    withMockedNodeEnv('test', () => {
      const testId = 'my-custom-website-schema';
      render(<StructuredData data={mockWebSiteData} id={testId} />);
      const scriptTag = screen.getByTestId(`structured-data-${testId}`);
      expect(scriptTag).toBeInTheDocument();
      expect(scriptTag).toHaveAttribute('id', testId);
    });
  });

  it('should render different types of schema data correctly', () => {
    withMockedNodeEnv('test', () => {
      const { rerender } = render(<StructuredData data={mockWebSiteData} id='website-data' />);
      let scriptTag = screen.getByTestId('structured-data-website-data');
      expect(scriptTag.innerHTML).toBe(JSON.stringify(mockWebSiteData));

      rerender(<StructuredData data={mockOrganizationData} id='org-data' />);
      scriptTag = screen.getByTestId('structured-data-org-data');
      expect(scriptTag.innerHTML).toBe(JSON.stringify(mockOrganizationData));
    });
  });

  it('should return null if no data is provided', () => {
    withMockedNodeEnv('test', () => {
      // @ts-expect-error Testing invalid prop for null case
      const { container } = render(<StructuredData data={null} />);
      expect(container.firstChild).toBeNull();
    });
  });

  it('should return null if data is undefined', () => {
    withMockedNodeEnv('test', () => {
      // @ts-expect-error Testing invalid prop for null case
      const { container } = render(<StructuredData data={undefined} />);
      expect(container.firstChild).toBeNull();
    });
  });
});
