/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:5000', '127.0.0.1:5000'],
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
      '@shared': require('path').resolve(__dirname, 'shared'),
      '@assets': require('path').resolve(__dirname, 'attached_assets'),
    };
    return config;
  },
};

module.exports = nextConfig;
