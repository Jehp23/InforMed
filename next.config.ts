import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Bundlear Arkiv en las funciones serverless (evita "Failed to load external module" en Vercel).
  transpilePackages: ["@arkiv-network/sdk"],
};

export default nextConfig;
