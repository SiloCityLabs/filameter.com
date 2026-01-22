import withBundleAnalyzer from '@next/bundle-analyzer';
import fs from 'fs';

const bundleAnalyzer = withBundleAnalyzer({ enabled: process.env.ANALYZE === 'true' });

// Read the version directly from package.json
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
const appVersion = packageJson.version;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  trailingSlash: true,
  env: { NEXT_PUBLIC_APP_VERSION: appVersion },
  compiler: { removeConsole: process.env.NODE_ENV === 'production' },
  images: { unoptimized: true },
};

export default bundleAnalyzer(nextConfig);
