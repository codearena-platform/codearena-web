/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['@codearena/ui', 'three', '@react-three/fiber', '@react-three/drei'],
    basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
};

module.exports = nextConfig;
