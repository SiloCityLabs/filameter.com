import withBundleAnalyzer from '@next/bundle-analyzer';

const bundleAnalyzer = withBundleAnalyzer({ enabled: process.env.ANALYZE === 'true' });

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  trailingSlash: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production', // Only remove in production
  },
};

// Export the wrapped configuration
export default bundleAnalyzer(nextConfig);
