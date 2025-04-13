// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: false,
  reactStrictMode: true,
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
