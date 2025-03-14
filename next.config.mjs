// next.config.mjs
import { PHASE_DEVELOPMENT_SERVER } from "next/constants.js";
import * as dotenv from "dotenv";
import withPWA from "next-pwa";

const pwaConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: false,
  disable: false,
  precachingManifest: false,
});

/** @type {import('next').NextConfig} */
const nextConfig = (phase, { defaultConfig }) => {
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    dotenv.config({ path: ".env.local" });
  } else {
    dotenv.config({ path: ".env.production" });
  }

  const baseConfig = {
    ...defaultConfig,
    reactStrictMode: true,
    output: "export",
    images: {
      unoptimized: true,
    },
  };

  return pwaConfig(baseConfig);
};

export default nextConfig;
