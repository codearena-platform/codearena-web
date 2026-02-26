import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@codearena/ui'],
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
};

export default nextConfig;
