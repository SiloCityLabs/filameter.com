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
  };

  return baseConfig;
};

export default nextConfig;
