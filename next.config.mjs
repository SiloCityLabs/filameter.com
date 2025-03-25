// next.config.mjs
import { PHASE_DEVELOPMENT_SERVER } from "next/constants.js";
import * as dotenv from "dotenv";

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
    webpack: (config, { dev, isServer }) => {
      // Only apply these changes during development and on the client-side
      if (dev && !isServer) {
        config.watchOptions = {
          ignored: [
            "**/node_modules/**", // Exclude node_modules
            "**/.next/**", // Exclude Next.js build directory
            "**/out/**", // Exclude the output directory
          ],
        };
      }

      return config;
    },
  };

  return baseConfig;
};

export default nextConfig;
