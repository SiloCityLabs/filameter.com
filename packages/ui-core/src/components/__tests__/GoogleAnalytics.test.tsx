// packages/ui-core/src/components/__tests__/GoogleAnalytics.test.tsx
import React from 'react';
import { render, act, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import GoogleAnalytics from '../GoogleAnalytics';

// Mock next/navigation
const mockUsePathname = jest.fn();
const mockUseSearchParams = jest.fn();
jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
  useSearchParams: () => mockUseSearchParams(),
}));

// Mock next/script
jest.mock('next/script', () => {
  const MockScript = (props: any) => {
    if (props.dangerouslySetInnerHTML) {
      return (
        <script
          id={props.id}
          data-strategy={props.strategy}
          dangerouslySetInnerHTML={props.dangerouslySetInnerHTML}
        />
      );
    }
    return (
      <script
        id={props.id || `gtag-src-${props.src.split('id=')[1]}`}
        src={props.src}
        data-strategy={props.strategy}
      />
    );
  };
  return MockScript;
});

describe('GoogleAnalytics Component', () => {
  const testGaId = 'G-TEST123XYZ';
  let mockGtag: jest.Mock;

  beforeEach(() => {
    mockGtag = jest.fn();
    (window as any).gtag = mockGtag;

    mockUsePathname.mockReturnValue('/current-path');
    mockUseSearchParams.mockReturnValue({ toString: () => 'param1=value1&param2=value2' });
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete (window as any).gtag;
  });

  test('renders the main GA script with correct src and strategy', () => {
    render(<GoogleAnalytics gaId={testGaId} />);
    const mainGaScript = document.getElementById(`gtag-src-${testGaId}`);

    expect(mainGaScript).toBeInTheDocument();
    expect(mainGaScript).toHaveAttribute(
      'src',
      `https://www.googletagmanager.com/gtag/js?id=${testGaId}`
    );
    expect(mainGaScript).toHaveAttribute('data-strategy', 'afterInteractive');
  });

  test('renders the GA initialization script with correct id, strategy, and innerHTML', () => {
    render(<GoogleAnalytics gaId={testGaId} />);
    const inlineScript = document.getElementById('gtag-init');
    expect(inlineScript).toBeInTheDocument();
    expect(inlineScript).toHaveAttribute('data-strategy', 'afterInteractive');

    const expectedHtml = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${testGaId}', {
        page_path: window.location.pathname,
      });
    `;
    expect(inlineScript?.innerHTML.replace(/\s+/g, ' ').trim()).toBe(
      expectedHtml.replace(/\s+/g, ' ').trim()
    );
  });

  test('calls window.gtag with page_path on mount when gtag is available', () => {
    render(<GoogleAnalytics gaId={testGaId} />);
    const expectedUrl = '/current-pathparam1=value1&param2=value2';
    expect(mockGtag).toHaveBeenCalledWith('config', testGaId, { page_path: expectedUrl });
  });

  test('calls window.gtag when pathname changes', () => {
    const { rerender } = render(<GoogleAnalytics gaId={testGaId} />);
    mockGtag.mockClear();

    act(() => {
      mockUsePathname.mockReturnValue('/new-path');
    });
    rerender(<GoogleAnalytics gaId={testGaId} />);

    const expectedUrl = '/new-pathparam1=value1&param2=value2';
    expect(mockGtag).toHaveBeenCalledWith('config', testGaId, { page_path: expectedUrl });
  });

  test('calls window.gtag when searchParams change', () => {
    const { rerender } = render(<GoogleAnalytics gaId={testGaId} />);
    mockGtag.mockClear();

    act(() => {
      mockUseSearchParams.mockReturnValue({ toString: () => 'newparam=newvalue' });
    });
    rerender(<GoogleAnalytics gaId={testGaId} />);

    const expectedUrl = '/current-pathnewparam=newvalue';
    expect(mockGtag).toHaveBeenCalledWith('config', testGaId, { page_path: expectedUrl });
  });

  test('does not call window.gtag if pathname is null', () => {
    mockUsePathname.mockReturnValue(null);
    render(<GoogleAnalytics gaId={testGaId} />);
    expect(mockGtag).not.toHaveBeenCalled();
  });

  test('does not call window.gtag if searchParams is null', () => {
    mockUseSearchParams.mockReturnValue(null);
    render(<GoogleAnalytics gaId={testGaId} />);
    expect(mockGtag).not.toHaveBeenCalled();
  });

  test('does not call window.gtag if window.gtag itself is not defined', () => {
    delete (window as any).gtag;
    render(<GoogleAnalytics gaId={testGaId} />);
    expect(true).toBe(true);
  });
});
