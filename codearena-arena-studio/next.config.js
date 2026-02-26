/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['@codearena/ui'],
    basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
};

module.exports = nextConfig;
